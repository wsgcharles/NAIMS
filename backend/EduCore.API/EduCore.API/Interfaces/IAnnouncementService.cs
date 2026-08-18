using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAnnouncementService
{
    Task<List<AnnouncementResponse>> GetAllAsync();

    Task<List<AnnouncementResponse>> GetVisibleForRoleAsync(string role);

    Task<AnnouncementResponse?> GetByIdAsync(int id);

    Task<AnnouncementResponse> CreateAsync(CreateAnnouncementRequest request);

    Task<AnnouncementResponse?> UpdateAsync(int id, UpdateAnnouncementRequest request);

    Task<AnnouncementResponse?> SetPublishedAsync(int id, bool isPublished);

    Task<AnnouncementResponse?> SetArchivedAsync(int id, bool isArchived);

    Task<bool> DeleteAsync(int id);
}
