using EduCore.API.DTOs;
using EduCore.API.Helpers;
using EduCore.API.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EduCore.API.Services;

/// <summary>
/// Production email service using MailKit — the correct .NET SMTP library.
///
/// WHY MailKit instead of System.Net.Mail.SmtpClient:
///   - System.Net.Mail.SmtpClient has a known dispose-during-async bug that causes
///     silent failures (it logs "sent successfully" but the TCP stream is torn down).
///   - System.Net.Mail with EnableSsl=true on port 587 can behave unpredictably
///     (it conflates SSL-wrapping with STARTTLS upgrade).
///   - MailKit explicitly uses SecureSocketOptions.StartTls for port 587 (STARTTLS),
///     which is what Gmail requires. Connection failures throw real exceptions.
///   - MailKit exceptions bubble up correctly so the BackgroundWorker retry loop works.
/// </summary>
public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly IEmailQueue _emailQueue;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<SmtpSettings> smtpOptions,
        IEmailQueue emailQueue,
        ILogger<EmailService> logger)
    {
        _smtpSettings = smtpOptions.Value;
        _emailQueue = emailQueue;
        _logger = logger;
    }

    public Task QueueEmailAsync(string toEmail, string subject, string templateName, object viewModel)
    {
        _emailQueue.QueueEmail(new EmailItem
        {
            ToEmail = toEmail,
            Subject = subject,
            TemplateName = templateName,
            ViewModel = viewModel
        });

        _logger.LogInformation(
            "[EmailQueue] Queued email → To={To} | Subject={Subject} | Template={Template}",
            toEmail, subject, templateName);

        return Task.CompletedTask;
    }

    /// <summary>
    /// Sends a raw HTML email directly via MailKit SMTP.
    /// THROWS on failure — the caller (BackgroundWorker) handles retry logic.
    /// </summary>
    public async Task SendRawEmailAsync(string toEmail, string subject, string bodyHtml)
    {
        // ── Diagnostic dump before attempting SMTP ────────────────────────────────
        _logger.LogDebug(
            "[EmailService] SMTP Config → Host={Host} | Port={Port} | Username={Username} | " +
            "SenderEmail={SenderEmail} | SenderName={SenderName} | EnableSsl={EnableSsl}",
            _smtpSettings.Host,
            _smtpSettings.Port,
            _smtpSettings.Username ?? "(null)",
            _smtpSettings.SenderEmail,
            _smtpSettings.SenderName,
            _smtpSettings.EnableSsl);

        _logger.LogInformation(
            "[EmailService] Sending email → To={To} | Subject={Subject}",
            toEmail, subject);

        // Validate essential config before even opening a socket
        if (string.IsNullOrWhiteSpace(_smtpSettings.Host))
            throw new InvalidOperationException("SMTP Host is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.Username))
            throw new InvalidOperationException("SMTP Username is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.Password))
            throw new InvalidOperationException("SMTP Password is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.SenderEmail))
            throw new InvalidOperationException("SMTP SenderEmail is not configured.");

        // ── Build MimeMessage ────────────────────────────────────────────────────
        var message = new MimeMessage();

        message.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        if (!string.IsNullOrWhiteSpace(_smtpSettings.ReplyToAddress))
        {
            message.ReplyTo.Add(MailboxAddress.Parse(_smtpSettings.ReplyToAddress));
        }

        message.Body = new TextPart("html")
        {
            Text = bodyHtml
        };

        // ── Connect, authenticate, send via MailKit ──────────────────────────────
        using var client = new SmtpClient();

        // SecureSocketOptions.StartTls = connect on port 587 with plain TCP,
        // then upgrade to TLS via STARTTLS command. This is what Gmail port 587 requires.
        // Do NOT use SslOnConnect (port 465) unless you change the port.
        var secureOption = _smtpSettings.EnableSsl
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;

        _logger.LogDebug(
            "[EmailService] Connecting to {Host}:{Port} with {SecureOption}...",
            _smtpSettings.Host, _smtpSettings.Port, secureOption);

        try
        {
            await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, secureOption);
            _logger.LogDebug("[EmailService] SMTP connection established.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP connection FAILED → Host={Host} Port={Port} | " +
                "Error={Error} | InnerError={Inner}",
                _smtpSettings.Host, _smtpSettings.Port,
                ex.Message, ex.InnerException?.Message ?? "(none)");
            throw; // propagate — triggers BackgroundWorker retry
        }

        try
        {
            await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            _logger.LogDebug(
                "[EmailService] SMTP authenticated successfully as {Username}.",
                _smtpSettings.Username);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP authentication FAILED for user {Username} | " +
                "Error={Error} | InnerError={Inner}",
                _smtpSettings.Username,
                ex.Message, ex.InnerException?.Message ?? "(none)");
            await client.DisconnectAsync(true);
            throw; // propagate — triggers BackgroundWorker retry
        }

        try
        {
            await client.SendAsync(message);
            _logger.LogInformation(
                "[EmailService] ✅ Email sent successfully → To={To} | Subject={Subject}",
                toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP send FAILED → To={To} | Subject={Subject} | " +
                "Error={Error} | InnerError={Inner} | StackTrace={Stack}",
                toEmail, subject,
                ex.Message, ex.InnerException?.Message ?? "(none)",
                ex.StackTrace);
            throw; // propagate — triggers BackgroundWorker retry
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}
