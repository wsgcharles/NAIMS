using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemSettingsController : ControllerBase
{
    private readonly ISystemSettingsService _settingsService;

    public SystemSettingsController(ISystemSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    [Authorize(Roles = "SuperAdministrator,Administrator")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSchoolSettingRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var settings = await _settingsService.UpdateSettingsAsync(request);
        return Ok(settings);
    }
}
