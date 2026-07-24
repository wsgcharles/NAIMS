using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrarController : ControllerBase
{
    private readonly IRegistrarService _service;

    public RegistrarController(IRegistrarService service)
    {
        _service = service;
    }

    [HttpGet("Students")]
    public async Task<IActionResult> GetStudents()
    {
        var students = await _service.GetStudentsAsync();

        return Ok(students);
    }

    [HttpGet("Students/{studentId}")]
    public async Task<IActionResult> GetStudent(int studentId)
    {
        var student = await _service.GetStudentByIdAsync(studentId);

        if (student == null)
            return NotFound();

        return Ok(student);
    }

    /// <summary>
    /// Promote a student — deactivates their current section assignment
    /// and records the event in the student's history timeline.
    /// The new section assignment for the next year is created separately.
    /// </summary>
    [HttpPut("Students/{studentId}/promote")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> PromoteStudent(
        int studentId,
        PromoteStudentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        request.StudentId = studentId;

        var success = await _service.PromoteStudentAsync(request);

        if (!success)
            return NotFound(new { message = "Student not found or is not active." });

        return Ok(new { message = "Student promoted successfully." });
    }

    /// <summary>
    /// Transfer a student out — deactivates their current section assignment,
    /// marks the student as inactive, and records the event in the history timeline.
    /// </summary>
    [HttpPut("Students/{studentId}/transfer")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> TransferStudent(
        int studentId,
        TransferStudentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        request.StudentId = studentId;

        var success = await _service.TransferStudentAsync(request);

        if (!success)
            return NotFound(new { message = "Student not found." });

        return Ok(new { message = "Student transferred out successfully." });
    }

    /// <summary>
    /// Graduate a student — deactivates their current section assignment
    /// and records the graduation in the history timeline.
    /// The student record remains active for alumni/historical purposes.
    /// </summary>
    [HttpPut("Students/{studentId}/graduate")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GraduateStudent(
        int studentId,
        GraduateStudentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        request.StudentId = studentId;

        var success = await _service.GraduateStudentAsync(request);

        if (!success)
            return NotFound(new { message = "Student not found or is not active." });

        return Ok(new { message = "Student graduated successfully." });
    }
}