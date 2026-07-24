using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IDashboardService
{
    /// <summary>
    /// Returns high-level aggregate stats for the Admin dashboard:
    /// student counts, employee counts, section/subject totals, enrollment pipeline.
    /// </summary>
    Task<AdminDashboardStatsResponse> GetAdminStatsAsync();

    /// <summary>
    /// Returns the comprehensive analytics view for the Principal dashboard:
    /// school overview, enrollment funnel, section headcounts, subject performance,
    /// teacher workload, and student pass/fail rates.
    /// </summary>
    Task<PrincipalDashboardResponse> GetPrincipalDashboardAsync();
}
