using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectionsController : ControllerBase
{
    private readonly ISectionService _service;

    public SectionsController(ISectionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSectionRequest request)
    {
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateSectionRequest request)
    {
        var result = await _service.UpdateAsync(id, request);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _service.DeleteAsync(id))
            return NotFound();

        return NoContent();
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetStats()
    {
        return Ok(await _service.GetStatsAsync());
    }

    [HttpPut("{id}/toggle-status")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        if (!await _service.ToggleStatusAsync(id))
            return NotFound(new { message = "Section not found." });

        return Ok(new { message = "Section status updated successfully." });
    }

    [HttpPost("{id}/assign-teacher")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> AssignTeacher(int id, [FromBody] AssignSectionTeacherRequest request)
    {
        try
        {
            if (!await _service.AssignTeacherAsync(id, request))
                return BadRequest(new { message = "Failed to assign teacher to section subject." });

            return Ok(new { message = "Teacher assigned to section subject successfully." });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("INVALID_TEACHER_ASSIGNMENT"))
        {
            return BadRequest(new { code = "INVALID_TEACHER_ASSIGNMENT", message = ex.Message.Replace("INVALID_TEACHER_ASSIGNMENT: ", "") });
        }
    }


    [HttpPost("{id}/assign-subjects")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> AssignSubjects(int id, [FromBody] AssignSectionSubjectsRequest request)
    {
        if (!await _service.AssignSubjectsAsync(id, request))
            return BadRequest(new { message = "Failed to assign subjects to section." });

        return Ok(new { message = "Subjects assigned to section successfully." });
    }

    [HttpGet("available-for-enrollment/{applicationId}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetAvailableSectionsForEnrollment(int applicationId)
    {
        var result = await _service.GetAvailableSectionsForEnrollmentAsync(applicationId);
        return Ok(result);
    }

    [HttpPost("validate-enrollment")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> ValidateSectionForEnrollment([FromBody] ValidateSectionEnrollmentRequest request)
    {
        var result = await _service.ValidateSectionForEnrollmentAsync(request.ApplicationId, request.SectionId);
        if (!result.IsValid)
        {
            return Conflict(result);
        }
        return Ok(result);
    }
}


public class ValidateSectionEnrollmentRequest
{
    public int ApplicationId { get; set; }
    public int SectionId { get; set; }
}