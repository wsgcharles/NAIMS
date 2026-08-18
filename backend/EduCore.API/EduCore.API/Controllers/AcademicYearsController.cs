using EduCore.API.Interfaces;
using EduCore.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AcademicYearsController : ControllerBase
{
    private readonly IAcademicYearService _service;

    public AcademicYearsController(IAcademicYearService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var active = await _service.GetActiveAsync();
        if (active == null)
            return NotFound(new { message = "No active School Year found." });

        return Ok(active);
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
    [Authorize(Roles = "SuperAdministrator,Administrator,Registrar")]
    public async Task<IActionResult> Create(CreateAcademicYearRequest request)
    {
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdministrator,Administrator,Registrar")]
    public async Task<IActionResult> Update(int id, UpdateAcademicYearRequest request)
    {
        var result = await _service.UpdateAsync(id, request);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdministrator,Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _service.DeleteAsync(id))
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/set-active")]
    [Authorize(Roles = "SuperAdministrator,Administrator,Registrar")]
    public async Task<IActionResult> SetActive(int id)
    {
        if (!await _service.SetActiveAsync(id))
            return NotFound();

        return Ok(new { message = "School Year is now active." });
    }

    [HttpPut("{id}/set-semester")]
    [Authorize(Roles = "SuperAdministrator,Administrator,Registrar")]
    public async Task<IActionResult> SetSemester(int id, [FromBody] SetSemesterRequest request)
    {
        if (!await _service.SetSemesterAsync(id, request.Semester))
            return NotFound();

        return Ok(new { message = $"Semester updated to {request.Semester}." });
    }

    [HttpPut("{id}/archive")]
    [Authorize(Roles = "SuperAdministrator,Administrator,Registrar")]
    public async Task<IActionResult> Archive(int id)
    {
        if (!await _service.ArchiveAsync(id))
            return NotFound();

        return Ok(new { message = "School Year archived." });
    }
}

public class SetSemesterRequest
{
    public string Semester { get; set; } = "1st Semester";
}