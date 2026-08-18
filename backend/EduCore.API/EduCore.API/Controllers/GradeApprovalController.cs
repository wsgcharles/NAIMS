using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdministrator,Administrator,Principal,Registrar")]
public class GradeApprovalController : ControllerBase
{
    private readonly IGradeApprovalService _service;

    public GradeApprovalController(IGradeApprovalService service)
    {
        _service = service;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingApprovals()
    {
        var result = await _service.GetPendingApprovalsAsync();
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllGradesForApproval([FromQuery] int? academicYearId, [FromQuery] string? status)
    {
        var result = await _service.GetAllGradesForApprovalAsync(academicYearId, status);
        return Ok(result);
    }

    [HttpPut("{gradeId}/approve")]
    public async Task<IActionResult> ApproveGrade(int gradeId, [FromBody] ApproveGradeRequest? request)
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.ApproveGradeAsync(userId, gradeId, request?.Remarks);

        if (!success) return BadRequest(new { message = "Unable to approve grade record." });

        return Ok(new { message = "Grade approved successfully." });
    }

    [HttpPut("class/{teachingAssignmentId}/approve")]
    public async Task<IActionResult> ApproveClassGrades(int teachingAssignmentId, [FromBody] ApproveGradeRequest? request)
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.ApproveClassGradesAsync(userId, teachingAssignmentId, request?.Remarks);

        if (!success) return BadRequest(new { message = "No submitted grades found for this class to approve." });

        return Ok(new { message = "Class grades approved successfully." });
    }

    [HttpPut("{gradeId}/reject")]
    public async Task<IActionResult> RejectGrade(int gradeId, [FromBody] RejectGradeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.RejectGradeAsync(userId, gradeId, request.Remarks);

        if (!success) return BadRequest(new { message = "Unable to reject grade record." });

        return Ok(new { message = "Grade returned to teacher for revision." });
    }

    [HttpPut("class/{teachingAssignmentId}/reject")]
    public async Task<IActionResult> RejectClassGrades(int teachingAssignmentId, [FromBody] RejectGradeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.RejectClassGradesAsync(userId, teachingAssignmentId, request.Remarks);

        if (!success) return BadRequest(new { message = "No submitted grades found for this class to reject." });

        return Ok(new { message = "Class grades returned to teacher for revision." });
    }

    [HttpPut("class/{teachingAssignmentId}/release")]
    public async Task<IActionResult> ReleaseClassGrades(int teachingAssignmentId)
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var success = await _service.ReleaseClassGradesAsync(userId, teachingAssignmentId);

        if (!success) return BadRequest(new { message = "No approved grades found for this class to release." });

        return Ok(new { message = "Class grades officially released to Student & Parent Portals." });
    }
}
