using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly EduCoreDbContext _context;

    public AnnouncementService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementResponse>> GetAllAsync()
    {
        var announcements = await _context.Set<Announcement>()
            .Include(a => a.CreatedByEmployee)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return announcements.Select(MapToResponse).ToList();
    }


    public async Task<List<AnnouncementResponse>> GetVisibleForRoleAsync(string role)
    {
        var announcements = await _context.Set<Announcement>()
            .Include(a => a.CreatedByEmployee)
            .Where(a => a.IsPublished && !a.IsArchived)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync();

        return announcements
            .Where(a => a.TargetRoles == "All" || a.TargetRoles.Split(',').Select(r => r.Trim()).Contains(role))
            .Select(a => MapToResponse(a))
            .ToList();
    }

    public async Task<AnnouncementResponse?> GetByIdAsync(int id)
    {
        var announcement = await _context.Set<Announcement>()
            .Include(a => a.CreatedByEmployee)
            .FirstOrDefaultAsync(a => a.Id == id);

        return announcement == null ? null : MapToResponse(announcement);
    }

    public async Task<AnnouncementResponse> CreateAsync(CreateAnnouncementRequest request)
    {
        var announcement = new Announcement
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            TargetRoles = request.TargetRoles,
            CreatedByEmployeeId = request.CreatedByEmployeeId,
            IsPublished = false,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Announcement>().Add(announcement);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(announcement.Id))!;
    }

    public async Task<AnnouncementResponse?> UpdateAsync(int id, UpdateAnnouncementRequest request)
    {
        var announcement = await _context.Set<Announcement>().FirstOrDefaultAsync(a => a.Id == id);
        if (announcement == null) return null;

        announcement.Title = request.Title;
        announcement.Content = request.Content;
        announcement.Category = request.Category;
        announcement.TargetRoles = request.TargetRoles;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<AnnouncementResponse?> SetPublishedAsync(int id, bool isPublished)
    {
        var announcement = await _context.Set<Announcement>().FirstOrDefaultAsync(a => a.Id == id);
        if (announcement == null) return null;

        announcement.IsPublished = isPublished;
        announcement.PublishedAt = isPublished ? DateTime.UtcNow : null;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<AnnouncementResponse?> SetArchivedAsync(int id, bool isArchived)
    {
        var announcement = await _context.Set<Announcement>().FirstOrDefaultAsync(a => a.Id == id);
        if (announcement == null) return null;

        announcement.IsArchived = isArchived;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var announcement = await _context.Set<Announcement>().FirstOrDefaultAsync(a => a.Id == id);
        if (announcement == null) return false;

        _context.Set<Announcement>().Remove(announcement);
        await _context.SaveChangesAsync();
        return true;
    }

    private static AnnouncementResponse MapToResponse(Announcement a)
    {
        return new AnnouncementResponse
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            Category = a.Category,
            TargetRoles = a.TargetRoles,
            IsPublished = a.IsPublished,
            PublishedAt = a.PublishedAt,
            IsArchived = a.IsArchived,
            CreatedByName = a.CreatedByEmployee != null
                ? $"{a.CreatedByEmployee.FirstName} {a.CreatedByEmployee.LastName}"
                : null,
            CreatedAt = a.CreatedAt
        };
    }
}
