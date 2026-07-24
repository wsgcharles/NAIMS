using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    /// <summary>
    /// Admin dashboard — quick aggregate counts for students, employees,
    /// sections, subjects, and the enrollment application pipeline.
    /// Accessible by Administrator, SuperAdministrator, and Registrar.
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar")]
    public async Task<IActionResult> GetAdminStats()
    {
        var stats = await _service.GetAdminStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Principal dashboard — rich analytics view covering school overview,
    /// enrollment funnel, section headcounts, subject performance (avg grade +
    /// pass rate), teacher workload, and overall student performance summary.
    /// Accessible by Principal, Administrator, and SuperAdministrator.
    /// </summary>
    [HttpGet("principal")]
    [Authorize(Roles = "Principal,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetPrincipalDashboard()
    {
        var dashboard = await _service.GetPrincipalDashboardAsync();
        return Ok(dashboard);
    }
}
