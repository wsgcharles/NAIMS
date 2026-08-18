using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator,SuperAdministrator,Principal,Registrar,Accountant")]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _service;

    public ReportsController(IReportsService service)
    {
        _service = service;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ReportsOverviewResponse>> GetOverview()
    {
        var result = await _service.GetOverviewAsync();
        return Ok(result);
    }

    [HttpGet("students")]
    public async Task<ActionResult<List<StudentReportItem>>> GetStudentReport()
    {
        var result = await _service.GetStudentReportAsync();
        return Ok(result);
    }

    [HttpGet("teachers")]
    public async Task<ActionResult<List<TeacherReportItem>>> GetTeacherReport()
    {
        var result = await _service.GetTeacherReportAsync();
        return Ok(result);
    }

    [HttpGet("finance")]
    public async Task<ActionResult<List<FinanceReportItem>>> GetFinanceReport()
    {
        var result = await _service.GetFinanceReportAsync();
        return Ok(result);
    }

    [HttpGet("grades")]
    public async Task<ActionResult<List<GradeReportItem>>> GetGradeReport()
    {
        var result = await _service.GetGradeReportAsync();
        return Ok(result);
    }

    [HttpGet("analytics/enrollment-trends")]
    public async Task<ActionResult<List<EnrollmentTrendDto>>> GetEnrollmentTrends()
    {
        var result = await _service.GetEnrollmentTrendsAsync();
        return Ok(result);
    }
}
