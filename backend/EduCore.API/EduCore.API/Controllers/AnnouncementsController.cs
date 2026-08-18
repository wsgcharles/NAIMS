using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _service;

    public AnnouncementsController(IAnnouncementService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("visible")]
    public async Task<IActionResult> GetVisible()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(role))
            return Unauthorized();

        return Ok(await _service.GetVisibleForRoleAsync(role));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Create(CreateAnnouncementRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Update(int id, UpdateAnnouncementRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, request);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("{id}/publish")]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Publish(int id, [FromQuery] bool isPublished = true)
    {
        var result = await _service.SetPublishedAsync(id, isPublished);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("{id}/archive")]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Archive(int id, [FromQuery] bool isArchived = true)
    {
        var result = await _service.SetArchivedAsync(id, isArchived);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator,SuperAdministrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
