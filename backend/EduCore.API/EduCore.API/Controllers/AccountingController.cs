using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Accounting,Cashier,Administrator,SuperAdministrator")]
public class AccountingController : ControllerBase
{
    private readonly IAccountingService _accountingService;

    public AccountingController(IAccountingService accountingService)
    {
        _accountingService = accountingService;
    }

    #region School Fees Catalog

    [HttpGet("Fees")]
    public async Task<IActionResult> GetSchoolFees([FromQuery] int? academicYearId, [FromQuery] int? gradeLevelId)
    {
        var fees = await _accountingService.GetSchoolFeesAsync(academicYearId, gradeLevelId);
        return Ok(fees);
    }

    [HttpGet("Fees/{id}")]
    public async Task<IActionResult> GetSchoolFeeById(int id)
    {
        var fee = await _accountingService.GetSchoolFeeByIdAsync(id);
        if (fee == null) return NotFound("School fee not found.");
        return Ok(fee);
    }

    [HttpPost("Fees")]
    public async Task<IActionResult> CreateSchoolFee([FromBody] CreateSchoolFeeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var fee = await _accountingService.CreateSchoolFeeAsync(request);
        return CreatedAtAction(nameof(GetSchoolFeeById), new { id = fee.Id }, fee);
    }

    [HttpPut("Fees/{id}")]
    public async Task<IActionResult> UpdateSchoolFee(int id, [FromBody] UpdateSchoolFeeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var fee = await _accountingService.UpdateSchoolFeeAsync(id, request);
        if (fee == null) return NotFound("School fee not found.");
        return Ok(fee);
    }

    [HttpDelete("Fees/{id}")]
    public async Task<IActionResult> DeleteSchoolFee(int id)
    {
        var success = await _accountingService.DeleteSchoolFeeAsync(id);
        if (!success) return NotFound("School fee not found.");
        return NoContent();
    }

    #endregion

    #region Bills

    [HttpPost("Bills/Generate/{enrollmentId}")]
    public async Task<IActionResult> GenerateBill(int enrollmentId)
    {
        try
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            int? userId = int.TryParse(userIdClaim, out var parsedId) ? parsedId : null;

            var bill = await _accountingService.GenerateBillForEnrollmentAsync(enrollmentId, userId);
            return Ok(bill);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("Bills/{id}")]
    public async Task<IActionResult> GetBillById(int id)
    {
        var bill = await _accountingService.GetBillByIdAsync(id);
        if (bill == null) return NotFound("Student bill not found.");
        return Ok(bill);
    }

    [HttpGet("Bills/Student/{studentId}")]
    public async Task<IActionResult> GetBillsByStudentId(int studentId)
    {
        var bills = await _accountingService.GetBillsByStudentIdAsync(studentId);
        return Ok(bills);
    }

    #endregion

    #region Payments & Receipts

    [HttpPost("Payments")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                request.ProcessedByUserId = userId;
            }

            var payment = await _accountingService.ProcessPaymentAsync(request);
            return Ok(payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("Payments/{id}")]
    public async Task<IActionResult> GetPaymentById(int id)
    {
        var payment = await _accountingService.GetPaymentByIdAsync(id);
        if (payment == null) return NotFound("Payment record not found.");
        return Ok(payment);
    }

    [HttpGet("Payments/Student/{studentId}")]
    public async Task<IActionResult> GetPaymentsByStudentId(int studentId)
    {
        var payments = await _accountingService.GetPaymentsByStudentIdAsync(studentId);
        return Ok(payments);
    }

    [HttpGet("Receipts/Payment/{paymentId}")]
    public async Task<IActionResult> GetReceiptByPaymentId(int paymentId)
    {
        var receipt = await _accountingService.GetReceiptByPaymentIdAsync(paymentId);
        if (receipt == null) return NotFound("Official receipt not found.");
        return Ok(receipt);
    }

    [HttpGet("Receipts/Student/{studentId}")]
    public async Task<IActionResult> GetReceiptsByStudentId(int studentId)
    {
        var receipts = await _accountingService.GetReceiptsByStudentIdAsync(studentId);
        return Ok(receipts);
    }

    #endregion

    #region Ledger & Dashboard

    [HttpGet("Ledger/{studentId}")]
    public async Task<IActionResult> GetStudentLedger(int studentId)
    {
        try
        {
            var ledger = await _accountingService.GetStudentLedgerAsync(studentId);
            return Ok(ledger);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("Dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard = await _accountingService.GetAccountingDashboardAsync();
        return Ok(dashboard);
    }

    #endregion
}
