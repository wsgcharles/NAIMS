using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

   
    [HttpGet]
    public async Task<ActionResult<List<EmployeeResponse>>> GetAll()
    {
        var employees = await _employeeService.GetAllAsync();
        return Ok(employees);
    }

   
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeResponse>> GetById(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);

        if (employee == null)
            return NotFound("Employee not found.");

        return Ok(employee);
    }


    [HttpPost]
    public async Task<ActionResult<EmployeeResponse>> Create(CreateEmployeeRequest request)
    {
        var employee = await _employeeService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = employee.Id },
            employee);
    }

    
    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeResponse>> Update(
        int id,
        UpdateEmployeeRequest request)
    {
        var employee = await _employeeService.UpdateAsync(id, request);

        if (employee == null)
            return NotFound("Employee not found.");

        return Ok(employee);
    }

   
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _employeeService.DeleteAsync(id);

        if (!deleted)
            return NotFound("Employee not found.");

        return NoContent();
    }

    
    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var updated = await _employeeService.ToggleStatusAsync(id);

        if (!updated)
            return NotFound("Employee not found.");

        return Ok(new
        {
            message = "Employee status updated successfully."
        });
    }
}