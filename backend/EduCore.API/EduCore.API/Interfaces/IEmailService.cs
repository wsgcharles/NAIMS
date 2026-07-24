using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IEmailService
{
    Task SendRawEmailAsync(string toEmail, string subject, string bodyHtml);
    Task QueueEmailAsync(string toEmail, string subject, string templateName, object viewModel);
}
