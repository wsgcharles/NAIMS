using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetForUserAsync(int userId);

    Task<int> GetUnreadCountAsync(int userId);

    Task<bool> MarkAsReadAsync(int userId, int notificationId);

    Task MarkAllAsReadAsync(int userId);

    Task<List<NotificationResponse>> CreateAsync(CreateNotificationRequest request);

    // Called internally by other services (Accounting, Registrar, Grades, ...) to notify a specific user.
    Task NotifyUserAsync(int userId, string title, string message, string type = "Info");
}
