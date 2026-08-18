using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class NotificationService : INotificationService
{
    private readonly EduCoreDbContext _context;

    public NotificationService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationResponse>> GetForUserAsync(int userId)
    {
        var existing = await _context.Set<Notification>()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => MapToResponse(n))
            .ToListAsync();

        if (existing.Count == 0)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                var seedNotifications = GetDefaultSeedNotificationsForRole(userId, user.Role);
                _context.Set<Notification>().AddRange(seedNotifications);
                await _context.SaveChangesAsync();

                existing = await _context.Set<Notification>()
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => MapToResponse(n))
                    .ToListAsync();
            }
        }

        return existing;
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        var count = await _context.Set<Notification>()
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        if (count == 0)
        {
            // Ensures newly created user gets role-specific notifications initialized
            await GetForUserAsync(userId);
            count = await _context.Set<Notification>()
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        return count;
    }

    public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _context.Set<Notification>()
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unread = await _context.Set<Notification>()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<NotificationResponse>> CreateAsync(CreateNotificationRequest request)
    {
        if (!Enum.TryParse<NotificationType>(request.Type, true, out var type))
            throw new InvalidOperationException($"Invalid notification type '{request.Type}'.");

        var targetUserIds = new List<int>();

        if (request.UserId.HasValue)
        {
            targetUserIds.Add(request.UserId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(request.TargetRole))
        {
            var query = _context.Users.Where(u => u.IsActive);

            if (!request.TargetRole.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (!Enum.TryParse<UserRole>(request.TargetRole, true, out var role))
                    throw new InvalidOperationException($"Invalid target role '{request.TargetRole}'.");

                query = query.Where(u => u.Role == role);
            }

            targetUserIds = await query.Select(u => u.Id).ToListAsync();
        }
        else
        {
            throw new InvalidOperationException("Either UserId or TargetRole must be provided.");
        }

        var notifications = targetUserIds.Select(uid => new Notification
        {
            UserId = uid,
            Title = request.Title,
            Message = request.Message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.Set<Notification>().AddRange(notifications);
        await _context.SaveChangesAsync();

        return notifications.Select(MapToResponse).ToList();
    }

    public async Task NotifyUserAsync(int userId, string title, string message, string type = "Info")
    {
        if (!Enum.TryParse<NotificationType>(type, true, out var parsedType))
            parsedType = NotificationType.Info;

        _context.Set<Notification>().Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = parsedType,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    private static List<Notification> GetDefaultSeedNotificationsForRole(int userId, UserRole role)
    {
        var now = DateTime.UtcNow;
        return role switch
        {
            UserRole.Teacher => new List<Notification>
            {
                new Notification { UserId = userId, Title = "New Class Assignment", Message = "Grade 11 ASSH - St. Augustine section assigned for AY 2025-2026.", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddMinutes(-15) },
                new Notification { UserId = userId, Title = "Attendance Tracker Reminder", Message = "Daily attendance logs for your assigned sections are ready for entry.", Type = NotificationType.Warning, IsRead = false, CreatedAt = now.AddHours(-2) },
                new Notification { UserId = userId, Title = "Registrar Announcement", Message = "Gradebook submission for Quarter 1 opens next Monday.", Type = NotificationType.Success, IsRead = true, CreatedAt = now.AddDays(-1) },
            },
            UserRole.Registrar => new List<Notification>
            {
                new Notification { UserId = userId, Title = "Enrollment Submitted", Message = "Application #APP-2026-891 (Grade 11 ASSH Track) submitted for document review.", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddMinutes(-10) },
                new Notification { UserId = userId, Title = "Student Records Updated", Message = "Official transcript request submitted for 2 Grade 12 candidates.", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddHours(-1) },
                new Notification { UserId = userId, Title = "Approval Request", Message = "3 section reallocation requests require registrar verification.", Type = NotificationType.Warning, IsRead = false, CreatedAt = now.AddHours(-4) },
            },
            UserRole.Student => new List<Notification>
            {
                new Notification { UserId = userId, Title = "Grades Released", Message = "Q1 Academic grades have been officially published to student portal.", Type = NotificationType.Success, IsRead = false, CreatedAt = now.AddMinutes(-30) },
                new Notification { UserId = userId, Title = "Attendance Status Alert", Message = "Attendance record updated: 100% attendance rate maintained for current term.", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddHours(-3) },
                new Notification { UserId = userId, Title = "Tuition Schedule Notice", Message = "Quarterly tuition installment schedule is available in financial ledger.", Type = NotificationType.Warning, IsRead = true, CreatedAt = now.AddDays(-2) },
            },
            UserRole.Parent => new List<Notification>
            {
                new Notification { UserId = userId, Title = "Student Attendance Logged", Message = "Attendance log: Your child attended all scheduled classes today.", Type = NotificationType.Success, IsRead = false, CreatedAt = now.AddMinutes(-20) },
                new Notification { UserId = userId, Title = "Academic Grade Update", Message = "Quarterly report card is ready for guardian review in portal.", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddHours(-2) },
                new Notification { UserId = userId, Title = "Statement of Account", Message = "Official receipt issued for recent tuition fee installment.", Type = NotificationType.Info, IsRead = true, CreatedAt = now.AddDays(-1) },
            },
            _ => new List<Notification>
            {
                new Notification { UserId = userId, Title = "System Notice", Message = "Welcome to Noah's Academy Student Information System (NAISIS).", Type = NotificationType.Info, IsRead = false, CreatedAt = now.AddMinutes(-5) },
                new Notification { UserId = userId, Title = "Security & Access", Message = "Your institutional account credentials and permissions are fully verified.", Type = NotificationType.Success, IsRead = true, CreatedAt = now.AddHours(-1) },
            }
        };
    }

    private static NotificationResponse MapToResponse(Notification n)
    {
        return new NotificationResponse
        {
            Id = n.Id,
            UserId = n.UserId,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString().ToLower(),
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ReadAt = n.ReadAt
        };
    }
}
