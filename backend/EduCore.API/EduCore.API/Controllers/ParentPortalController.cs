using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Parent")]
public class ParentPortalController : ControllerBase
{
    private readonly IParentPortalService _service;
    private readonly IAccountingService _accountingService;

    public ParentPortalController(IParentPortalService service, IAccountingService accountingService)
    {
        _service = service;
        _accountingService = accountingService;
    }

    private async Task<int> GetParentIdAsync()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;
        if (int.TryParse(userIdClaim, out int userId))
        {
            var parentId = await _service.GetParentIdByUserIdAsync(userId);
            if (parentId.HasValue) return parentId.Value;
        }
        throw new UnauthorizedAccessException("Parent profile not found for the current user.");
    }

    [HttpGet("Profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var profile = await _service.GetProfileAsync(parentId);
            
            if (profile == null)
                return NotFound("Parent profile not found.");

            return Ok(profile);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children")]
    public async Task<IActionResult> GetChildren()
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var children = await _service.GetChildrenAsync(parentId);
            return Ok(children);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}")]
    public async Task<IActionResult> GetChildDetails(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var child = await _service.GetChildDetailsAsync(parentId, id);
            
            if (child == null)
                return NotFound("Child not found or you do not have permission to view this child.");

            return Ok(child);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Subjects")]
    public async Task<IActionResult> GetChildSubjects(int id, [FromQuery] int academicYearId)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var subjects = await _service.GetChildSubjectsAsync(parentId, id, academicYearId);
            return Ok(subjects);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Grades")]
    public async Task<IActionResult> GetChildGrades(int id, [FromQuery] int academicYearId)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var grades = await _service.GetChildGradesAsync(parentId, id, academicYearId);
            return Ok(grades);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Enrollments")]
    public async Task<IActionResult> GetChildEnrollments(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var enrollments = await _service.GetChildEnrollmentsAsync(parentId, id);
            return Ok(enrollments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Billing")]
    public async Task<IActionResult> GetChildBilling(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var child = await _service.GetChildDetailsAsync(parentId, id);
            if (child == null)
                return NotFound("Child not found or permission denied.");

            var bills = await _accountingService.GetBillsByStudentIdAsync(id);
            return Ok(bills);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Payments")]
    public async Task<IActionResult> GetChildPayments(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var child = await _service.GetChildDetailsAsync(parentId, id);
            if (child == null)
                return NotFound("Child not found or permission denied.");

            var payments = await _accountingService.GetPaymentsByStudentIdAsync(id);
            return Ok(payments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Receipts")]
    public async Task<IActionResult> GetChildReceipts(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var child = await _service.GetChildDetailsAsync(parentId, id);
            if (child == null)
                return NotFound("Child not found or permission denied.");

            var receipts = await _accountingService.GetReceiptsByStudentIdAsync(id);
            return Ok(receipts);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("Children/{id}/Ledger")]
    public async Task<IActionResult> GetChildLedger(int id)
    {
        try
        {
            var parentId = await GetParentIdAsync();
            var child = await _service.GetChildDetailsAsync(parentId, id);
            if (child == null)
                return NotFound("Child not found or permission denied.");

            var ledger = await _accountingService.GetStudentLedgerAsync(id);
            return Ok(ledger);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}
