using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAuditLogService
{
    // Self-resolves the acting user and IP address from the current HTTP context.
    Task LogAsync(string action, string? entityType = null, string? entityId = null, string? details = null);

    Task<PagedAuditLogResponse> GetAsync(AuditLogFilterRequest filter);
}
