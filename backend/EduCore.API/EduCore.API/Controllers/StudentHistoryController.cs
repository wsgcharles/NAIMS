using EduCore.API.Data;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentHistoryController : ControllerBase
{
    private readonly IStudentHistoryService _service;
    private readonly EduCoreDbContext _context;

    public StudentHistoryController(IStudentHistoryService service, EduCoreDbContext context)
    {
        _service = service;
        _context = context;
    }

    /// <summary>
    /// Get a student's full academic history / timeline.
    /// Accessible by Registrar, Administrator, SuperAdministrator.
    /// </summary>
    [HttpGet("{studentId}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetByStudentId(int studentId)
    {
        var history = await _service.GetByStudentIdAsync(studentId);

        return Ok(history);
    }

    /// <summary>
    /// Student views their own academic history / timeline.
    /// Uses the UserId claim from the JWT to locate the linked student.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
            return NotFound(new { message = "Student account is not linked to a student record." });

        var history = await _service.GetByStudentIdAsync(student.Id);
        return Ok(history);
    }
}
