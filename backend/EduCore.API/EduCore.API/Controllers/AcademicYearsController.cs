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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAcademicYearRequest request)
    {
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateAcademicYearRequest request)
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

    [HttpPut("{id}/set-active")]
    public async Task<IActionResult> SetActive(int id)
    {
        if (!await _service.SetActiveAsync(id))
            return NotFound();

        return Ok(new
        {
            message = "Academic Year is now active."
        });
    }
}