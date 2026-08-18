using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class TeacherDashboardController : ControllerBase
{
    private readonly ITeacherDashboardService _service;

    public TeacherDashboardController(ITeacherDashboardService service)
    {
        _service = service;
    }

    [HttpGet("MyClasses")]
    public async Task<IActionResult> GetMyClasses()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var result = await _service.GetMyClassesAsync(userId);

        return Ok(result);
    }

    [HttpGet("Students/{teachingAssignmentId}")]
    public async Task<IActionResult> GetStudents(int teachingAssignmentId)
    {
        var result = await _service.GetStudentsAsync(teachingAssignmentId);

        return Ok(result);
    }

    [HttpGet("MyClasses/{teachingAssignmentId}/Grades")]
    public async Task<IActionResult> GetGrades(int teachingAssignmentId)
    {
        var grades = await _service.GetGradesAsync(teachingAssignmentId);

        return Ok(grades);
    }

    [HttpPut("Grades/{gradeId}")]
    public async Task<IActionResult> UpdateGrade(
        int gradeId,
        UpdateTeacherGradeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var success = await _service.UpdateGradeAsync(
            userId,
            gradeId,
            request);

        if (!success)
        {
            return BadRequest(new
            {
                message = "Unable to update grade."
            });
        }

        return Ok(new
        {
            message = "Grade updated successfully."
        });
    }

    [HttpPut("MyClasses/{teachingAssignmentId}/ReleaseGrades")]
    public async Task<IActionResult> ReleaseGrades(
        int teachingAssignmentId,
        ReleaseGradesRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        var success = await _service.ReleaseGradesAsync(
            userId,
            teachingAssignmentId,
            request.IsReleased);

        if (!success)
        {
            return BadRequest(new
            {
                message = "Unable to release grades."
            });
        }

        return Ok(new
        {
            message = request.IsReleased
                ? "Grades released successfully."
                : "Grades unpublished successfully."
        });
    }

    [HttpPost("MyClasses/{teachingAssignmentId}/SubmitForApproval")]
    public async Task<IActionResult> SubmitForApproval(int teachingAssignmentId)
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.SubmitGradesForApprovalAsync(userId, teachingAssignmentId);

        if (!success)
        {
            return BadRequest(new { message = "Unable to submit grades for approval. Ensure grades exist and are in Draft or Rejected status." });
        }

        return Ok(new { message = "Grades submitted to the Academic Head / Vice Principal for approval." });
    }
}