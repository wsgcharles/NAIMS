using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AuditLogService : IAuditLogService
{
    private readonly EduCoreDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(EduCoreDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(string action, string? entityType = null, string? entityId = null, string? details = null)
    {
        var httpContext = _httpContextAccessor.HttpContext;

        int? userId = null;
        var userIdClaim = httpContext?.User?.FindFirst("UserId")?.Value;
        if (int.TryParse(userIdClaim, out var parsedUserId))
            userId = parsedUserId;

        var userEmail = httpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var ipAddress = httpContext?.Connection?.RemoteIpAddress?.ToString();

        _context.Set<AuditLog>().Add(new AuditLog
        {
            UserId = userId,
            UserEmail = userEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    public async Task<PagedAuditLogResponse> GetAsync(AuditLogFilterRequest filter)
    {
        var query = _context.Set<AuditLog>().AsQueryable();

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.Timestamp >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.Timestamp <= filter.ToDate.Value);

        if (filter.UserId.HasValue)
            query = query.Where(a => a.UserId == filter.UserId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Action))
            query = query.Where(a => a.Action.Contains(filter.Action));

        if (!string.IsNullOrWhiteSpace(filter.EntityType))
            query = query.Where(a => a.EntityType == filter.EntityType);

        var totalCount = await query.CountAsync();

        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize is < 1 or > 200 ? 50 : filter.PageSize;

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogResponse
            {
                Id = a.Id,
                UserEmail = a.UserEmail,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Details = a.Details,
                IpAddress = a.IpAddress,
                Timestamp = a.Timestamp
            })
            .ToListAsync();

        return new PagedAuditLogResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
