using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IGradeLevelService
{
    Task<List<GradeLevelResponse>> GetAllAsync();
    Task<GradeLevelResponse?> GetByIdAsync(int id);
    Task<GradeLevelResponse> CreateAsync(CreateGradeLevelRequest request);
    Task<GradeLevelResponse?> UpdateAsync(int id, UpdateGradeLevelRequest request);
    Task<bool> DeleteAsync(int id);
}
