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
        _logger.LogInformation("[EmailBackgroundWorker] Hosted service started and listening for queued emails.");

        while (!stoppingToken.IsCancellationRequested)
        {
            EmailItem? item = null;

            try
            {
                item = await _queue.DequeueAsync(stoppingToken);

                _logger.LogInformation(
                    "[EmailBackgroundWorker] Dequeued email → To={To} | Subject={Subject} | Template={Template}",
                    item.ToEmail, item.Subject, item.TemplateName);

                await ProcessEmailItemAsync(item, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("[EmailBackgroundWorker] Cancellation requested — shutting down.");
                break;
            }
            catch (Exception ex)
            {
                // This outer catch handles failures in dequeue or ProcessEmailItemAsync that escape
                // (e.g., DB errors saving the log). We log and continue so the worker doesn't die.
                _logger.LogError(ex,
                    "[EmailBackgroundWorker] Unhandled error processing queued email → To={To} | Error={Error}",
                    item?.ToEmail ?? "(unknown)", ex.Message);
            }
        }

        _logger.LogInformation("[EmailBackgroundWorker] Hosted service stopped.");
    }

    private async Task ProcessEmailItemAsync(EmailItem item, CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<EduCoreDbContext>();
        var settingsService = scope.ServiceProvider.GetRequiredService<ISystemSettingsService>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        // Load school settings for template rendering
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

        string htmlBody;
        try
        {
            htmlBody = RenderTemplate(item.TemplateName, item.ViewModel, settings);
            _logger.LogDebug(
                "[EmailBackgroundWorker] Template '{Template}' rendered successfully ({Length} chars).",
                item.TemplateName, htmlBody.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailBackgroundWorker] Template render FAILED → Template={Template} | Error={Error}",
                item.TemplateName, ex.Message);
            throw;
        }

        // Create an email log entry
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

        _logger.LogInformation(
            "[EmailBackgroundWorker] EmailLog#{Id} created. Beginning send attempts (max 3).",
            log.Id);

        // Retry loop — up to 3 attempts with exponential backoff
        const int maxRetries = 3;
        bool sent = false;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            _logger.LogInformation(
                "[EmailBackgroundWorker] Attempt {Attempt}/{Max} → To={To} | Subject={Subject}",
                attempt, maxRetries, item.ToEmail, item.Subject);

            try
            {
                await emailService.SendRawEmailAsync(item.ToEmail, item.Subject, htmlBody);

                // Only reaches here if SendRawEmailAsync did NOT throw
                log.RetryCount = attempt;
                log.Status = EmailStatus.Sent;
                log.ErrorMessage = null;
                sent = true;

                _logger.LogInformation(
                    "[EmailBackgroundWorker] ✅ EmailLog#{Id} marked Sent on attempt {Attempt}.",
                    log.Id, attempt);
                break;
            }
            catch (Exception ex)
            {
                // SendRawEmailAsync THROWS on failure — this catch is now correctly reached
                log.RetryCount = attempt;
                log.ErrorMessage = ex.Message.Length > 500
                    ? ex.Message[..500]
                    : ex.Message;

                _logger.LogWarning(
                    "[EmailBackgroundWorker] ❌ Attempt {Attempt}/{Max} FAILED → To={To} | " +
                    "Error={Error} | Inner={Inner}",
                    attempt, maxRetries, item.ToEmail,
                    ex.Message, ex.InnerException?.Message ?? "(none)");

                if (attempt < maxRetries)
                {
                    var delay = TimeSpan.FromSeconds(attempt * 2); // 2s, 4s
                    _logger.LogInformation(
                        "[EmailBackgroundWorker] Waiting {Delay}s before retry {Next}...",
                        delay.TotalSeconds, attempt + 1);
                    await Task.Delay(delay, stoppingToken);
                }
            }
        }

        if (!sent)
        {
            log.Status = EmailStatus.Failed;
            _logger.LogError(
                "[EmailBackgroundWorker] ❌ EmailLog#{Id} marked FAILED after {Max} attempts → To={To} | LastError={Error}",
                log.Id, maxRetries, item.ToEmail, log.ErrorMessage);
        }

        await dbContext.SaveChangesAsync(stoppingToken);
    }

    private static string RenderTemplate(string templateName, object vm, SchoolSettingResponse settings)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append($"<!DOCTYPE html><html><body style='font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;'>");
        sb.Append($"<div style='max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;'>");

        // Header - Noah's Academy Branding (Purple & Gold Gradient)
        sb.Append($"<div style='background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%); padding: 28px 24px; text-align: center; border-bottom: 4px solid #eab308;'>");
        sb.Append($"<h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;'>Noah's Academy Incorporated</h1>");
        sb.Append($"<p style='color: #fef08a; margin: 4px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; tracking: 1px;'>Arca South Campus</p>");
        sb.Append($"</div>");

        sb.Append($"<div style='padding: 32px 28px;'>");

        // Content body based on ViewModel type
        if (vm is EmployeeWelcomeEmailViewModel emp)
        {
            sb.Append($"<h2 style='color: #6b21a8; margin-top: 0; font-size: 18px; font-weight: 800;'>Welcome to Noah's Academy, {emp.EmployeeName}!</h2>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>An official staff account has been generated for you with the role of <strong>{emp.Role}</strong>.</p>");
            sb.Append($"<div style='background-color: #f3e8ff; border-left: 4px solid #9333ea; padding: 16px; border-radius: 8px; margin: 20px 0;'>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Username / Email:</strong> {emp.Username}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #d8b4fe; font-family: monospace;'>{emp.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #dc2626; font-weight: bold; font-size: 13px;'>⚠️ You are required to change your password immediately upon first login.</p>");
        }
        else if (vm is StudentWelcomeEmailViewModel stu)
        {
            sb.Append($"<h2 style='color: #6b21a8; margin-top: 0; font-size: 18px; font-weight: 800;'>Welcome, {stu.StudentName}!</h2>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>Your enrollment at <strong>Noah's Academy Incorporated – Arca South Campus</strong> has been officially approved for <strong>{stu.GradeLevel}</strong> ({stu.SectionName}).</p>");
            sb.Append($"<div style='background-color: #f3e8ff; border-left: 4px solid #9333ea; padding: 16px; border-radius: 8px; margin: 20px 0;'>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Student Number:</strong> {stu.StudentNumber}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Portal Email:</strong> {stu.Username}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #d8b4fe; font-family: monospace;'>{stu.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #dc2626; font-weight: bold; font-size: 13px;'>⚠️ Please log in to your student portal and change your password.</p>");
        }
        else if (vm is ParentWelcomeEmailViewModel parent)
        {
            sb.Append($"<h2 style='color: #6b21a8; margin-top: 0; font-size: 18px; font-weight: 800;'>Parent Portal Account Created</h2>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>Dear {parent.ParentName}, a Parent Portal account has been created for you as the registered guardian of <strong>{parent.StudentName}</strong>.</p>");
            sb.Append($"<div style='background-color: #f3e8ff; border-left: 4px solid #9333ea; padding: 16px; border-radius: 8px; margin: 20px 0;'>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Parent Portal Email:</strong> {parent.Username}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Temporary Password:</strong> <code style='font-size: 1.1em; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #d8b4fe; font-family: monospace;'>{parent.TemporaryPassword}</code></p>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #dc2626; font-weight: bold; font-size: 13px;'>⚠️ Please change your password upon your first login.</p>");
        }
        else if (vm is PasswordResetEmailViewModel reset)
        {
            sb.Append($"<h2 style='color: #6b21a8; margin-top: 0; font-size: 18px; font-weight: 800;'>Password Reset Verification Code</h2>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>Hello,</p>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>A request has been received to reset the password for your Noah's Academy account.</p>");
            sb.Append($"<p style='color: #334155; font-size: 14px; font-weight: 700; margin-bottom: 8px;'>Your verification code is:</p>");
            sb.Append($"<div style='background-color: #faf5ff; border: 2px dashed #9333ea; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;'>");
            sb.Append($"  <span style='font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #581c87; font-family: Consolas, Monaco, monospace;'>{reset.VerificationCode}</span>");
            sb.Append($"</div>");
            sb.Append($"<p style='color: #64748b; font-size: 13px; margin-bottom: 8px;'>This code will expire in <strong>{reset.ExpirationMinutes} minutes</strong>.</p>");
            sb.Append($"<p style='color: #64748b; font-size: 13px;'>If you did not request this password reset, you may safely ignore this email.</p>");
            sb.Append($"<br/>");
            sb.Append($"<p style='color: #334155; font-size: 14px; margin: 0;'>Regards,</p>");
            sb.Append($"<p style='color: #6b21a8; font-size: 14px; font-weight: 800; margin: 4px 0 0 0;'>Noah's Academy Incorporated</p>");
            sb.Append($"<p style='color: #64748b; font-size: 12px; margin: 2px 0 0 0;'>Arca South Campus</p>");
        }
        else if (vm is PaymentReceiptEmailViewModel receipt)
        {
            sb.Append($"<h2 style='color: #16a34a; margin-top: 0; font-size: 18px; font-weight: 800;'>Official Payment Receipt Received</h2>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>Dear {receipt.PayerName},</p>");
            sb.Append($"<p style='color: #334155; font-size: 14px; line-height: 1.6;'>Thank you for your payment. Here is the official receipt summary for student <strong>{receipt.StudentName}</strong>:</p>");
            sb.Append($"<div style='background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin: 20px 0;'>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Official Receipt No:</strong> {receipt.ReceiptNumber}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Amount Paid:</strong> {settings.Currency} {receipt.AmountPaid:N2}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Remaining Balance:</strong> {settings.Currency} {receipt.RemainingBalance:N2}</p>");
            sb.Append($"<p style='margin: 4px 0; font-size: 13px;'><strong>Payment Date:</strong> {receipt.PaymentDate:yyyy-MM-dd HH:mm}</p>");
            sb.Append($"</div>");
        }
        else
        {
            sb.Append($"<p style='color: #334155; font-size: 14px;'>Notification from Noah's Academy Incorporated</p>");
        }

        sb.Append($"</div>"); // End body container

        // Footer - Institutional Branding
        sb.Append($"<div style='background-color: #f1f5f9; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;'>");
        sb.Append($"<p style='font-weight: 800; color: #475569; margin: 0 0 4px 0;'>Noah's Academy Incorporated</p>");
        sb.Append($"<p style='margin: 0 0 8px 0; line-height: 1.5;'>31 DBP Avenue, Arca South, Western Bicutan, Taguig City<br>Email: charlesuday12@gmail.com</p>");
        sb.Append($"<p style='font-size: 11px; color: #94a3b8; margin: 12px 0 0 0; font-style: italic; border-top: 1px solid #cbd5e1; padding-top: 8px;'>This is an automated message generated by the Noah's Academy Student Information System (NAISIS). Please do not reply directly to this email.</p>");
        sb.Append($"</div></div></body></html>");

        return sb.ToString();
    }
}
