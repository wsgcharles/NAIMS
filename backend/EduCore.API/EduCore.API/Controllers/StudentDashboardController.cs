using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class StudentDashboardController : ControllerBase
{
    private readonly IStudentDashboardService _service;
    private readonly IAccountingService _accountingService;
    private readonly EduCore.API.Data.EduCoreDbContext _context;

    public StudentDashboardController(
        IStudentDashboardService service,
        IAccountingService accountingService,
        EduCore.API.Data.EduCoreDbContext context)
    {
        _service = service;
        _accountingService = accountingService;
        _context = context;
    }

    [HttpGet("Profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var profile = await _service.GetProfileAsync(userId);

        if (profile == null)
            return NotFound(new
            {
                message = "Student not found."
            });

        return Ok(profile);
    }

    [HttpGet("Subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var result = await _service.GetSubjectsAsync(userId);

        return Ok(result);
    }

    [HttpGet("Grades")]
    public async Task<IActionResult> GetGrades()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var result = await _service.GetGradesAsync(userId);

        return Ok(result);
    }

    [HttpGet("Financials")]
    public async Task<IActionResult> GetFinancials()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var student = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(_context.Students, s => s.UserId == userId);
        if (student == null) return NotFound("Student record not found.");

        var bills = await _accountingService.GetBillsByStudentIdAsync(student.Id);
        return Ok(bills);
    }

    [HttpGet("Ledger")]
    public async Task<IActionResult> GetLedger()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var student = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(_context.Students, s => s.UserId == userId);
        if (student == null) return NotFound("Student record not found.");

        var ledger = await _accountingService.GetStudentLedgerAsync(student.Id);
        return Ok(ledger);
    }
}