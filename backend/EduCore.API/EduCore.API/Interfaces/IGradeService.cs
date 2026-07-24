using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IGradeService
{
    Task<List<GradeResponse>> GetAllAsync();

    Task<GradeResponse?> GetByIdAsync(int id);

    Task<GradeResponse> CreateAsync(CreateGradeRequest request);

    Task<GradeResponse?> UpdateAsync(int id, UpdateGradeRequest request);

    Task<bool> DeleteAsync(int id);
}