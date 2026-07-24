using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _studentService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _studentService.GetByIdAsync(id);

        if (student == null)
            return NotFound();

        return Ok(student);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateStudentRequest request)
    {
        var student = await _studentService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = student.Id },
            student);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateStudentRequest request)
    {
        var student = await _studentService.UpdateAsync(id, request);

        if (student == null)
            return NotFound();

        return Ok(student);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var success = await _studentService.ToggleStatusAsync(id);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _studentService.DeleteAsync(id);

        if (!success)
            return NotFound();

        return NoContent();
    }
}