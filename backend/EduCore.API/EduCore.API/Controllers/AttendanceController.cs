using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(IAttendanceService service)
    {
        _service = service;
    }

    [HttpGet("Roster/{teachingAssignmentId}")]
    [Authorize(Roles = "Teacher,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetRoster(int teachingAssignmentId, [FromQuery] DateTime date)
    {
        try
        {
            var roster = await _service.GetRosterAsync(teachingAssignmentId, date);
            return Ok(roster);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("Submit")]
    [Authorize(Roles = "Teacher,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Submit(SubmitAttendanceRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _service.SubmitAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("Student/{studentId}")]
    [Authorize(Roles = "Teacher,Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetByStudent(int studentId)
    {
        return Ok(await _service.GetByStudentIdAsync(studentId));
    }

    [HttpGet("Student/{studentId}/Summary")]
    [Authorize(Roles = "Teacher,Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetSummaryByStudent(int studentId)
    {
        return Ok(await _service.GetSummaryByStudentIdAsync(studentId));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyAttendance()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var studentId = await _service.GetStudentIdByUserIdAsync(userId);

        if (studentId == null)
            return NotFound("Student record not found.");

        return Ok(await _service.GetByStudentIdAsync(studentId.Value));
    }

    [HttpGet("my/summary")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySummary()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var studentId = await _service.GetStudentIdByUserIdAsync(userId);

        if (studentId == null)
            return NotFound("Student record not found.");

        return Ok(await _service.GetSummaryByStudentIdAsync(studentId.Value));
    }
}
