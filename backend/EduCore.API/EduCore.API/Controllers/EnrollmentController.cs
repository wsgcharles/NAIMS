using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _service;

    public EnrollmentController(IEnrollmentService service)
    {
        _service = service;
    }

    /// <summary>
    /// Public — any applicant can submit an enrollment application.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(CreateEnrollmentRequest request)
    {
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [HttpGet]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Update(
        int id,
        UpdateEnrollmentRequest request)
    {
        var result = await _service.UpdateAsync(id, request);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _service.DeleteAsync(id))
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Simple status-only approval (no student account created).
    /// Use approve-and-enroll for the full pipeline.
    /// </summary>
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Approve(int id)
    {
        if (!await _service.ApproveAsync(id))
            return NotFound();

        return Ok(new { message = "Application approved." });
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Reject(int id)
    {
        if (!await _service.RejectAsync(id))
            return NotFound();

        return Ok(new { message = "Application rejected." });
    }

    /// <summary>
    /// Full enrollment pipeline — approves the application AND automatically
    /// creates a Student record + User account with a temporary password.
    /// The Registrar must provide the verified LRN from the applicant's documents.
    /// Returns the temporary password to be handed securely to the student.
    /// </summary>
    [HttpPut("{id}/approve-and-enroll")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> ApproveAndEnroll(
        int id,
        ApproveAndEnrollRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _service.ApproveAndEnrollAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}