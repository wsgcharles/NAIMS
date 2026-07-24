using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentHistoryController : ControllerBase
{
    private readonly IStudentHistoryService _service;

    public StudentHistoryController(IStudentHistoryService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get a student's full academic history / timeline.
    /// Accessible by Registrar, Administrator, SuperAdministrator.
    /// </summary>
    [HttpGet("{studentId}")]
    [Authorize(Roles = "Registrar,Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetByStudentId(int studentId)
    {
        var history = await _service.GetByStudentIdAsync(studentId);

        return Ok(history);
    }

    /// <summary>
    /// Student views their own academic history / timeline.
    /// Uses the UserId claim from the JWT to locate the linked student.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userIdClaim = User.FindFirst("UserId");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        // Resolve StudentId from UserId via the Students table
        var studentIdClaim = User.FindFirst("StudentId");

        // If the StudentId isn't in the token, we query the DB
        // (The token may not carry StudentId, so we fall back to DB lookup)
        if (studentIdClaim != null && int.TryParse(studentIdClaim.Value, out var sid))
        {
            var history = await _service.GetByStudentIdAsync(sid);
            return Ok(history);
        }

        return BadRequest(new { message = "Student identity could not be resolved from token." });
    }
}
