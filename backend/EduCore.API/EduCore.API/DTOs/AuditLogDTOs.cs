namespace EduCore.API.DTOs;

public class AuditLogResponse
{
    public int Id { get; set; }

    public string? UserEmail { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? EntityType { get; set; }

    public string? EntityId { get; set; }

    public string? Details { get; set; }

    public string? IpAddress { get; set; }

    public DateTime Timestamp { get; set; }
}

public class AuditLogFilterRequest
{
    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public int? UserId { get; set; }

    public string? Action { get; set; }

    public string? EntityType { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 50;
}

public class PagedAuditLogResponse
{
    public List<AuditLogResponse> Items { get; set; } = new();

    public int TotalCount { get; set; }

    public int Page { get; set; }

    public int PageSize { get; set; }
}
