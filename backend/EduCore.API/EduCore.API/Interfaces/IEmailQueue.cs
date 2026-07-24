using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IEmailQueue
{
    void QueueEmail(EmailItem item);
    ValueTask<EmailItem> DequeueAsync(CancellationToken cancellationToken);
}
