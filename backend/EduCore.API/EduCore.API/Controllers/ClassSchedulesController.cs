using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassSchedulesController : ControllerBase
{
    private readonly IClassScheduleService _service;

    public ClassSchedulesController(IClassScheduleService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("TeachingAssignment/{teachingAssignmentId}")]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar,Teacher")]
    public async Task<IActionResult> GetByTeachingAssignment(int teachingAssignmentId)
    {
        return Ok(await _service.GetByTeachingAssignmentAsync(teachingAssignmentId));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySchedule()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var studentId = await _service.GetStudentIdByUserIdAsync(userId);
        if (studentId == null) return NotFound("Student record not found.");

        return Ok(await _service.GetByStudentIdAsync(studentId.Value));
    }

    [HttpGet("my-teaching")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetMyTeachingSchedule()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        return Ok(await _service.GetByTeacherUserIdAsync(userId));
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar")]
    public async Task<IActionResult> Create(CreateClassScheduleRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.CreateAsync(request);
            return CreatedAtAction(nameof(GetByTeachingAssignment), new { teachingAssignmentId = result.TeachingAssignmentId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar")]
    public async Task<IActionResult> Update(int id, UpdateClassScheduleRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.UpdateAsync(id, request);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator,SuperAdministrator,Registrar")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
