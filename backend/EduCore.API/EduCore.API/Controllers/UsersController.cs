using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdministrator")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

   
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

   
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var user = await _userService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.Id },
            user);
    }

   
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateUserRequest request)
    {
        var user = await _userService.UpdateAsync(id, request);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var success = await _userService.ToggleStatusAsync(id);

        if (!success)
            return NotFound();

        return NoContent();
    }

    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _userService.DeleteAsync(id);

        if (!success)
            return NotFound();

        return NoContent();
    }
}