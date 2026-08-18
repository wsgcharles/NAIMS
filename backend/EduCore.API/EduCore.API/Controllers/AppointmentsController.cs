using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IEnrollmentService _service;
    private readonly EduCoreDbContext _context;

    public AppointmentsController(IEnrollmentService service, EduCoreDbContext context)
    {
        _service = service;
        _context = context;
    }

    private async Task<Employee?> GetAuthenticatedEmployeeAsync()
    {
        var userClaim = User.FindFirst("UserId")?.Value 
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("sub")?.Value;

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value 
                         ?? User.FindFirst("email")?.Value;

        if (int.TryParse(userClaim, out var parsedId))
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.Id == parsedId || e.UserId == parsedId);
            if (emp != null) return emp;
        }

        if (!string.IsNullOrEmpty(emailClaim))
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.Email.ToLower() == emailClaim.ToLower().Trim());
            if (emp != null) return emp;
        }

        return null;
    }

    [HttpGet("queue")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetAppointmentQueue([FromQuery] string? status, [FromQuery] DateTime? date)
    {
        var queue = await _service.GetAppointmentQueueAsync(status, date);
        return Ok(queue);
    }

    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> ConfirmAppointment(int id, [FromBody] UpdateAppointmentStatusDto? request)
    {
        request ??= new UpdateAppointmentStatusDto();
        request.Status = "Confirmed";
        return await UpdateStatus(id, request);
    }

    [HttpPut("{id}/complete")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> CompleteAppointment(int id, [FromBody] UpdateAppointmentStatusDto? request)
    {
        request ??= new UpdateAppointmentStatusDto();
        request.Status = "Completed";
        return await UpdateStatus(id, request);
    }

    [HttpPut("{id}/reschedule")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] UpdateAppointmentStatusDto request)
    {
        if (request == null) return BadRequest(new { message = "Invalid reschedule payload." });
        request.Status = "Rescheduled";
        return await UpdateStatus(id, request);
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator,Applicant,Student")]
    public async Task<IActionResult> CancelAppointment(int id, [FromBody] UpdateAppointmentStatusDto? request)
    {
        request ??= new UpdateAppointmentStatusDto();
        request.Status = "Cancelled";
        return await UpdateStatus(id, request);
    }

    private async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusDto request)
    {
        try
        {
            var employee = await GetAuthenticatedEmployeeAsync();
            if (employee == null)
            {
                return StatusCode(403, new { message = "The authenticated user is not linked to an employee record." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Registrar";

            var result = await _service.UpdateAppointmentStatusAsync(id, request, employee.Id, role);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
