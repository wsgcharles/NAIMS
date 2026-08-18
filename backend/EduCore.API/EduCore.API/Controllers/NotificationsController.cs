using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("UserId")?.Value;
        if (!int.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("User identity could not be resolved from token.");
        return userId;
    }

    [HttpGet]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyNotifications()
    {
        return Ok(await _service.GetForUserAsync(GetUserId()));
    }

    [HttpGet("unread-count")]
    [HttpGet("my/unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        return Ok(new { unreadCount = await _service.GetUnreadCountAsync(GetUserId()) });
    }

    [HttpPost("{id}/mark-read")]
    [HttpPost("{id}/read")]
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var success = await _service.MarkAsReadAsync(GetUserId(), id);
        if (!success) return NotFound();
        return Ok(new { message = "Notification marked as read." });
    }

    [HttpPost("mark-all-read")]
    [HttpPost("my/read-all")]
    [HttpPatch("my/read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _service.MarkAllAsReadAsync(GetUserId());
        return Ok(new { message = "All notifications marked as read." });
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Create(CreateNotificationRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.CreateAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
