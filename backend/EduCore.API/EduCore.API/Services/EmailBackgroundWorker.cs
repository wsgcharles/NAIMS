using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Interfaces;
using EduCore.API.Models;

namespace EduCore.API.Services;

public class EmailBackgroundWorker : BackgroundService
{
    private readonly IEmailQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailBackgroundWorker> _logger;

    public EmailBackgroundWorker(
        IEmailQueue queue,
        IServiceProvider serviceProvider,
        ILogger<EmailBackgroundWorker> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailBackgroundWorker hosted service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var item = await _queue.DequeueAsync(stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<EduCoreDbContext>();
                var settingsService = scope.ServiceProvider.GetRequiredService<ISystemSettingsService>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                var settings = await settingsService.GetSettingsAsync();

                // Inject SchoolSettings into ViewModel if derived from BaseEmailViewModel
                if (item.ViewModel is BaseEmailViewModel baseVm)
                {
                    baseVm.SchoolName = settings.SchoolName;
                    baseVm.SchoolLogoUrl = settings.SchoolLogoUrl;
                    baseVm.SchoolAddress = settings.Address;
                    baseVm.ContactEmail = settings.ContactEmail;
                    baseVm.ContactPhone = settings.ContactPhone;
                    baseVm.Currency = settings.Currency;
                }

                var htmlBody = RenderTemplate(item.TemplateName, item.ViewModel, settings);

                var log = new EmailLog
                {
                    RecipientEmail = item.ToEmail,
                    Subject = item.Subject,
                    TemplateName = item.TemplateName,
                    Status = EmailStatus.Queued,
                    RetryCount = 0,
                    SentAt = DateTime.UtcNow
                };

                dbContext.EmailLogs.Add(log);
                await dbContext.SaveChangesAsync(stoppingToken);

                // Attempt up to 3 retries
                int maxRetries = 3;
                bool sent = false;

                for (int attempt = 1; attempt <= maxRetries; attempt++)
                {
                    try
                    {
                        log.RetryCount = attempt;
                        await emailService.SendRawEmailAsync(item.ToEmail, item.Subject, htmlBody);
                        log.Status = EmailStatus.Sent;
                        log.ErrorMessage = null;
                        sent = true;
                        break;
                    }
                    catch (Exception ex)
                    {
                        log.ErrorMessage = ex.Message;
                        _logger.LogWarning("Attempt {Attempt} failed for {Email}: {Msg}", attempt, item.ToEmail, ex.Message);
                        if (attempt < maxRetries)
                        {
                            await Task.Delay(1000 * attempt, stoppingToken); // Backoff
                        }
                    }
                }

                if (!sent)
                {
                    log.Status = EmailStatus.Failed;
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing queued email in BackgroundWorker.");
            }
        }
    }

    private static string RenderTemplate(string templateName, object vm, SchoolSettingResponse settings)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append($"<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;'>");
        sb.Append($"<div style='max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>");
        
        // Header
        sb.Append($"<div style='text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;'>");
        if (!string.IsNullOrWhiteSpace(settings.SchoolLogoUrl))
        {
            sb.Append($"<img src='{settings.SchoolLogoUrl}' alt='{settings.SchoolName}' style='max-height: 60px; margin-bottom: 10px;'><br>");
        }
        sb.Append($"<h2 style='color: #1e293b; margin: 0;'>{settings.SchoolName}</h2>");
        sb.Append($"</div>");

        // Content body based on ViewModel type
        if (vm is EmployeeWelcomeEmailViewModel emp)
        {
            sb.Append($"<h3 style='color: #2563eb;'>Welcome to {settings.SchoolName}, {emp.EmployeeName}!</h3>");
            sb.Append($"<p>An official staff account has been generated for you with the role of <strong>{emp.Role}</strong>.</p>");
            sb.Append($"<div style='background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>");
            sb.Append($"<p><strong>Username / Email:</strong> {emp.Username}</p>");
            sb.Append($"<p><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>{emp.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #ef4444; font-weight: bold;'>⚠️ You are required to change your password immediately upon first login.</p>");
        }
        else if (vm is StudentWelcomeEmailViewModel stu)
        {
            sb.Append($"<h3 style='color: #2563eb;'>Welcome, {stu.StudentName}!</h3>");
            sb.Append($"<p>Your enrollment at <strong>{settings.SchoolName}</strong> has been officially approved for <strong>{stu.GradeLevel}</strong> ({stu.SectionName}).</p>");
            sb.Append($"<div style='background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>");
            sb.Append($"<p><strong>Student Number:</strong> {stu.StudentNumber}</p>");
            sb.Append($"<p><strong>Portal Email:</strong> {stu.Username}</p>");
            sb.Append($"<p><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>{stu.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #ef4444; font-weight: bold;'>⚠️ Please log in to your student portal and change your password.</p>");
        }
        else if (vm is ParentWelcomeEmailViewModel parent)
        {
            sb.Append($"<h3 style='color: #2563eb;'>Parent Portal Account Created</h3>");
            sb.Append($"<p>Dear {parent.ParentName}, a Parent Portal account has been created for you as the registered guardian of <strong>{parent.StudentName}</strong>.</p>");
            sb.Append($"<div style='background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>");
            sb.Append($"<p><strong>Parent Portal Email:</strong> {parent.Username}</p>");
            sb.Append($"<p><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>{parent.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #ef4444; font-weight: bold;'>⚠️ Please change your password upon your first login.</p>");
        }
        else if (vm is PasswordResetEmailViewModel reset)
        {
            sb.Append($"<h3 style='color: #2563eb;'>Password Reset Request</h3>");
            sb.Append($"<p>Dear {reset.RecipientName},</p>");
            sb.Append($"<p>We received a request to reset your EduCore password. Click the link below to set a new password:</p>");
            sb.Append($"<div style='text-align: center; margin: 25px 0;'>");
            sb.Append($"<a href='{reset.ResetLink}' style='background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Reset Password</a>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #64748b; font-size: 0.9em;'>This reset link expires in {reset.ExpirationMinutes} minutes. If you did not request a password reset, please ignore this email.</p>");
        }
        else if (vm is PaymentReceiptEmailViewModel receipt)
        {
            sb.Append($"<h3 style='color: #16a34a;'>Official Payment Receipt Received</h3>");
            sb.Append($"<p>Dear {receipt.PayerName},</p>");
            sb.Append($"<p>Thank you for your payment. Here is the official receipt summary for student <strong>{receipt.StudentName}</strong>:</p>");
            sb.Append($"<div style='background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;'>");
            sb.Append($"<p><strong>Official Receipt No:</strong> {receipt.ReceiptNumber}</p>");
            sb.Append($"<p><strong>Amount Paid:</strong> {settings.Currency} {receipt.AmountPaid:N2}</p>");
            sb.Append($"<p><strong>Remaining Balance:</strong> {settings.Currency} {receipt.RemainingBalance:N2}</p>");
            sb.Append($"<p><strong>Payment Date:</strong> {receipt.PaymentDate:yyyy-MM-dd HH:mm}</p>");
            sb.Append($"</div>");
        }
        else
        {
            sb.Append($"<p>Notification from {settings.SchoolName}</p>");
        }

        // Footer
        sb.Append($"<div style='margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.85em; color: #64748b;'>");
        sb.Append($"<p>{settings.SchoolName}<br>{settings.Address}<br>Email: {settings.ContactEmail} | Phone: {settings.ContactPhone}</p>");
        sb.Append($"</div></div></body></html>");

        return sb.ToString();
    }
}
