using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IStudentService
{
    Task<List<StudentResponse>> GetAllAsync();

    Task<StudentResponse?> GetByIdAsync(int id);

    Task<StudentResponse> CreateAsync(CreateStudentRequest request);

    Task<StudentResponse?> UpdateAsync(int id, UpdateStudentRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> ToggleStatusAsync(int id);
}