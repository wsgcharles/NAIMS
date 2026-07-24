using System.Net;
using System.Net.Mail;
using System.Text;
using EduCore.API.DTOs;
using EduCore.API.Helpers;
using EduCore.API.Interfaces;
using Microsoft.Extensions.Options;

namespace EduCore.API.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ISystemSettingsService _settingsService;
    private readonly IEmailQueue _emailQueue;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<SmtpSettings> smtpOptions,
        ISystemSettingsService settingsService,
        IEmailQueue emailQueue,
        ILogger<EmailService> logger)
    {
        _smtpSettings = smtpOptions.Value;
        _settingsService = settingsService;
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
        return Task.CompletedTask;
    }

    public async Task SendRawEmailAsync(string toEmail, string subject, string bodyHtml)
    {
        try
        {
            using var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port)
            {
                EnableSsl = _smtpSettings.EnableSsl,
                Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_smtpSettings.SenderEmail, _smtpSettings.SenderName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            if (!string.IsNullOrWhiteSpace(_smtpSettings.ReplyToAddress))
            {
                mailMessage.ReplyToList.Add(_smtpSettings.ReplyToAddress);
            }

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {Recipient}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("SMTP delivery warning for {Recipient}: {Message}", toEmail, ex.Message);
            throw; // Re-throw to trigger retry mechanism in EmailBackgroundWorker
        }
    }
}
