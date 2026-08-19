using EduCore.API.DTOs;
using EduCore.API.Helpers;
using EduCore.API.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Text;
using System.Text.Json;

namespace EduCore.API.Services;

/// <summary>
/// Production email service.
///
/// TWO send modes (selected automatically by configuration):
///
/// 1. BREVO HTTP API (preferred for cloud/Render):
///    Uses Brevo's transactional email REST API over HTTPS port 443.
///    Set SmtpSettings:BrevoApiKey to enable.
///    Render free tier blocks outbound SMTP (port 587), but never blocks HTTPS.
///
/// 2. SMTP via MailKit (local development):
///    Uses MailKit with STARTTLS on port 587.
///    Used when BrevoApiKey is not configured.
/// </summary>
public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly IEmailQueue _emailQueue;
    private readonly ILogger<EmailService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public EmailService(
        IOptions<SmtpSettings> smtpOptions,
        IEmailQueue emailQueue,
        ILogger<EmailService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _smtpSettings = smtpOptions.Value;
        _emailQueue = emailQueue;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
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
    /// Sends a raw HTML email.
    /// Routes to Brevo HTTP API or MailKit SMTP based on configuration.
    /// THROWS on failure — the caller (BackgroundWorker) handles retry logic.
    /// </summary>
    public async Task SendRawEmailAsync(string toEmail, string subject, string bodyHtml)
    {
        _logger.LogInformation(
            "[EmailService] Sending email → To={To} | Subject={Subject}",
            toEmail, subject);

        if (!string.IsNullOrWhiteSpace(_smtpSettings.BrevoApiKey))
        {
            await SendViaBrevoApiAsync(toEmail, subject, bodyHtml);
        }
        else
        {
            await SendViaSmtpAsync(toEmail, subject, bodyHtml);
        }
    }

    // ── Brevo HTTP API ────────────────────────────────────────────────────────────
    // Uses HTTPS port 443 — works on Render free tier (port 587 is blocked by Render).

    private async Task SendViaBrevoApiAsync(string toEmail, string subject, string bodyHtml)
    {
        _logger.LogInformation("[EmailService] Using Brevo HTTP API → To={To}", toEmail);

        var payload = new
        {
            sender = new { name = _smtpSettings.SenderName, email = _smtpSettings.SenderEmail },
            to = new[] { new { email = toEmail } },
            subject,
            htmlContent = bodyHtml
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("Brevo");
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("api-key", _smtpSettings.BrevoApiKey);
        client.DefaultRequestHeaders.Add("accept", "application/json");

        var response = await client.PostAsync("https://api.brevo.com/v3/smtp/email", content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "[EmailService] Brevo API FAILED → Status={Status} | Body={Body}",
                (int)response.StatusCode, responseBody);
            throw new InvalidOperationException(
                $"Brevo API returned {(int)response.StatusCode}: {responseBody}");
        }

        _logger.LogInformation(
            "[EmailService] ✅ Email sent via Brevo API → To={To} | Subject={Subject}",
            toEmail, subject);
    }

    // ── SMTP via MailKit ──────────────────────────────────────────────────────────
    // Used for local development where port 587 is accessible.

    private async Task SendViaSmtpAsync(string toEmail, string subject, string bodyHtml)
    {
        _logger.LogInformation("[EmailService] Using MailKit SMTP → Host={Host}:{Port}", _smtpSettings.Host, _smtpSettings.Port);

        if (string.IsNullOrWhiteSpace(_smtpSettings.Host))
            throw new InvalidOperationException("SMTP Host is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.Username))
            throw new InvalidOperationException("SMTP Username is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.Password))
            throw new InvalidOperationException("SMTP Password is not configured.");
        if (string.IsNullOrWhiteSpace(_smtpSettings.SenderEmail))
            throw new InvalidOperationException("SMTP SenderEmail is not configured.");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        if (!string.IsNullOrWhiteSpace(_smtpSettings.ReplyToAddress))
            message.ReplyTo.Add(MailboxAddress.Parse(_smtpSettings.ReplyToAddress));

        message.Body = new TextPart("html") { Text = bodyHtml };

        using var client = new SmtpClient();

        var secureOption = _smtpSettings.EnableSsl
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;

        try
        {
            await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, secureOption);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP connection FAILED → Host={Host} Port={Port} | Error={Error} | InnerError={Inner}",
                _smtpSettings.Host, _smtpSettings.Port, ex.Message, ex.InnerException?.Message ?? "(none)");
            throw;
        }

        try
        {
            await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP authentication FAILED for user {Username} | Error={Error} | InnerError={Inner}",
                _smtpSettings.Username, ex.Message, ex.InnerException?.Message ?? "(none)");
            await client.DisconnectAsync(true);
            throw;
        }

        try
        {
            await client.SendAsync(message);
            _logger.LogInformation(
                "[EmailService] ✅ Email sent via SMTP → To={To} | Subject={Subject}",
                toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailService] SMTP send FAILED → To={To} | Subject={Subject} | Error={Error} | InnerError={Inner}",
                toEmail, subject, ex.Message, ex.InnerException?.Message ?? "(none)");
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}
