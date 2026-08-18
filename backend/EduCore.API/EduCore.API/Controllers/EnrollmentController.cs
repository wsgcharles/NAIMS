using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _service;
    private readonly EduCoreDbContext _context;
    private readonly ILogger<EnrollmentController> _logger;

    public EnrollmentController(IEnrollmentService service, EduCoreDbContext context, ILogger<EnrollmentController> logger)
    {
        _service = service;
        _context = context;
        _logger = logger;
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

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(CreateEnrollmentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [HttpGet("track")]
    [AllowAnonymous]
    public async Task<IActionResult> Track([FromQuery] string applicationNumber, [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(applicationNumber) || string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Application reference number and email address are required." });

        var result = await _service.TrackApplicationAsync(applicationNumber, email);
        if (result == null)
            return NotFound(new { message = "No application found matching the provided reference number and email address." });

        return Ok(result);
    }

    [HttpGet("document-types")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDocumentTypes()
    {
        var docTypes = await _service.GetAdmissionDocumentTypesAsync();
        return Ok(docTypes);
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
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}/stage")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateApplicationStageRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var success = await _service.UpdateApplicationStageAsync(id, request);
        if (!success) return NotFound(new { message = "Application not found." });
        return Ok(new { message = "Application stage updated successfully." });
    }

    [HttpPut("{id}/assign-section")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> AssignSectionAndEnroll(int id, [FromBody] AssignSectionAndEnrollRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var success = await _service.AssignSectionAndEnrollAsync(id, request);
            if (!success) return NotFound(new { message = "Application or Section not found." });
            return Ok(new { message = "Student officially assigned to section and enrolled. Portal credentials dispatched." });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("EMPLOYEE_NOT_FOUND:"))
        {
            return StatusCode(401, new
            {
                code = "EMPLOYEE_NOT_FOUND",
                message = ex.Message.Replace("EMPLOYEE_NOT_FOUND:", "")
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("UNAUTHORIZED_EMPLOYEE:"))
        {
            return StatusCode(403, new
            {
                code = "UNAUTHORIZED_EMPLOYEE",
                message = ex.Message.Replace("UNAUTHORIZED_EMPLOYEE:", "")
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("PARENT_EMAIL_REQUIRED:"))
        {
            return StatusCode(400, new
            {
                code = "PARENT_EMAIL_REQUIRED",
                message = ex.Message.Replace("PARENT_EMAIL_REQUIRED:", "")
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("ENROLLMENT_PREREQUISITE_FAILED:"))
        {
            var missing = ex.Message.Replace("ENROLLMENT_PREREQUISITE_FAILED:", "").Split(" | ", StringSplitOptions.RemoveEmptyEntries);
            return StatusCode(409, new
            {
                code = "ENROLLMENT_PREREQUISITE_FAILED",
                message = "Enrollment cannot be completed.",
                missingRequirements = missing
            });
        }

        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new
            {
                code = "ENROLLMENT_PREREQUISITE_FAILED",
                message = "Enrollment cannot be completed.",
                missingRequirements = new[] { ex.Message }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Enrollment failed for application {ApplicationId}. Exception: {ExceptionType} | Inner: {Inner}",
                id, ex.GetType().FullName, ex.InnerException?.Message ?? "none");

            return StatusCode(500, new
            {
                message = $"Unable to complete enrollment: {ex.Message}",
                exceptionType = ex.GetType().FullName,
                innerException = ex.InnerException?.Message,
                innerInnerException = ex.InnerException?.InnerException?.Message,
                stackTrace = ex.StackTrace
            });
        }
    }


    [HttpGet("pending-section-assignment")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetPendingSectionAssignmentQueue()
    {
        var queue = await _service.GetPendingSectionAssignmentQueueAsync();
        return Ok(queue);
    }

    [HttpGet("archived")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetArchivedApplications()
    {
        var list = await _service.GetArchivedApplicationsAsync();
        return Ok(list);
    }

    [HttpGet("analytics/registrar")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetRegistrarAnalytics()
    {
        var analytics = await _service.GetRegistrarAnalyticsAsync();
        return Ok(analytics);
    }

    [HttpGet("analytics/accounting")]
    [Authorize(Roles = "Accountant,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetAccountingAnalytics()
    {
        var analytics = await _service.GetAccountingAnalyticsAsync();
        return Ok(analytics);
    }

    [HttpGet("analytics/principal")]
    [Authorize(Roles = "Principal,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetPrincipalAnalytics()
    {
        var analytics = await _service.GetPrincipalAnalyticsAsync();
        return Ok(analytics);
    }

    [HttpGet("student-status")]
    [Authorize(Roles = "Student,SuperAdministrator")]
    public async Task<IActionResult> GetStudentEnrollmentStatus()
    {
        var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var status = await _service.GetStudentEnrollmentStatusAsync(userId);
        return Ok(status);
    }

    [HttpPost("confirm-re-enrollment")]
    [Authorize(Roles = "Student,SuperAdministrator")]
    public async Task<IActionResult> ConfirmReEnrollment()
    {
        var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        try
        {
            var success = await _service.ConfirmStudentReEnrollmentAsync(userId);
            if (!success) return BadRequest(new { message = "Unable to process re-enrollment request." });
            return Ok(new { message = "Re-enrollment request submitted to Registrar & Accounting." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Update(int id, UpdateEnrollmentRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _service.DeleteAsync(id)) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Approve(int id)
    {
        if (!await _service.ApproveAsync(id)) return NotFound();
        return Ok(new { message = "Application approved." });
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> Reject(int id)
    {
        if (!await _service.RejectAsync(id)) return NotFound();
        return Ok(new { message = "Application rejected." });
    }

    [HttpPut("{id}/approve-and-enroll")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> ApproveAndEnroll(int id, ApproveAndEnrollRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
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

    // ── Digital Document Management System Endpoints ──────────────────────

    [HttpPost("{applicationId}/documents/{documentTypeId}/upload")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadDocument(
        int applicationId,
        int documentTypeId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Uploaded file is required and cannot be empty." });

        try
        {
            int? userId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var parsedId))
            {
                userId = parsedId;
            }

            var response = await _service.UploadDocumentAsync(applicationId, documentTypeId, file, userId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("documents/{documentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDocumentMetadata(int documentId)
    {
        var result = await _service.GetDocumentMetadataAsync(documentId);
        if (result == null) return NotFound(new { message = "Document not found." });
        return Ok(result);
    }

    [HttpGet("documents/{documentId}/download")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> DownloadDocument(int documentId)
    {
        try
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Applicant";
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            var fileResult = await _service.GetDocumentFileAsync(documentId, role, email);
            if (fileResult == null) return NotFound(new { message = "Physical document file not found on server." });

            return File(fileResult.Value.fileStream, fileResult.Value.contentType, fileResult.Value.originalFilename);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("documents/{documentId}/preview")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> PreviewDocument(int documentId)
    {
        try
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Applicant";
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            var fileResult = await _service.GetDocumentFileAsync(documentId, role, email);
            if (fileResult == null) return NotFound(new { message = "Physical document file not found on server." });

            Response.Headers.Append("Content-Disposition", $"inline; filename=\"{fileResult.Value.originalFilename}\"");
            return File(fileResult.Value.fileStream, fileResult.Value.contentType);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPut("documents/{documentId}/status")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> VerifyDocumentStatus(int documentId, [FromBody] VerifyDocumentRequestDto request)
    {
        if (request == null) return BadRequest(new { message = "Invalid status update payload." });

        try
        {
            var employee = await GetAuthenticatedEmployeeAsync();
            if (employee == null)
            {
                return StatusCode(403, new { message = "The authenticated user is not linked to an employee record." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Registrar";

            var result = await _service.VerifyDocumentStatusAsync(documentId, request, employee.Id, role);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Unable to verify document status: {ex.Message}" });
        }
    }

    [HttpPut("documents/{documentId}/original-status")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> VerifyOriginalDocumentStatus(int documentId, [FromBody] VerifyOriginalDocumentRequestDto request)
    {
        if (request == null) return BadRequest(new { message = "Invalid original status update payload." });

        try
        {
            var employee = await GetAuthenticatedEmployeeAsync();
            if (employee == null)
            {
                return StatusCode(403, new { message = "The authenticated user is not linked to an employee record." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Registrar";

            var result = await _service.VerifyOriginalDocumentStatusAsync(documentId, request, employee.Id, role);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Unable to verify original document status: {ex.Message}" });
        }
    }

    [HttpGet("documents/{documentId}/history")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetDocumentVersionHistory(int documentId)
    {
        var history = await _service.GetDocumentVersionHistoryAsync(documentId);
        return Ok(history);
    }

    [HttpPost("{applicationId}/appointment")]
    public async Task<IActionResult> ScheduleAppointment(int applicationId, [FromBody] CreateAppointmentRequestDto request)
    {
        if (request == null) return BadRequest(new { message = "Invalid appointment payload." });

        try
        {
            int? userId = null;
            var userClaim = User.FindFirst("UserId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userClaim) && int.TryParse(userClaim, out var parsed))
            {
                userId = parsed;
            }

            var appointment = await _service.ScheduleAppointmentAsync(applicationId, request, userId);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{applicationId}/appointment")]
    public async Task<IActionResult> GetAppointment(int applicationId)
    {
        var appointment = await _service.GetApplicationAppointmentAsync(applicationId);
        if (appointment == null) return NotFound(new { message = "No appointment scheduled." });
        return Ok(appointment);
    }

    [HttpPost("{applicationId}/verification-slip")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GenerateVerificationSlip(int applicationId)
    {
        try
        {
            var employee = await GetAuthenticatedEmployeeAsync();
            if (employee == null)
            {
                return StatusCode(403, new { message = "The authenticated user is not linked to an employee record." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Registrar";

            var slip = await _service.GenerateVerificationSlipAsync(applicationId, employee.Id, role);
            return Ok(slip);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Unable to generate verification slip: {ex.Message}" });
        }
    }

    [HttpGet("{applicationId}/verification-slip")]
    public async Task<IActionResult> GetVerificationSlip(int applicationId)
    {
        var slip = await _service.GetVerificationSlipAsync(applicationId);
        if (slip == null) return NotFound(new { message = "No verification slip issued." });
        return Ok(slip);
    }
}