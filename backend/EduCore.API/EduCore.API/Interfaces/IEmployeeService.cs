using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IEmployeeService
{
    Task<List<EmployeeResponse>> GetAllAsync();

    Task<EmployeeResponse?> GetByIdAsync(int id);

    Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request);

    Task<EmployeeResponse?> UpdateAsync(int id, UpdateEmployeeRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> ToggleStatusAsync(int id);
}