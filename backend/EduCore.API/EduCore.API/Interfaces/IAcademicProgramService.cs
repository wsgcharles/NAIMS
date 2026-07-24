using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAcademicProgramService
{
    Task<List<AcademicProgramResponse>> GetAllAsync();
    Task<AcademicProgramResponse?> GetByIdAsync(int id);
    Task<AcademicProgramResponse> CreateAsync(CreateAcademicProgramRequest request);
    Task<AcademicProgramResponse?> UpdateAsync(int id, UpdateAcademicProgramRequest request);
    Task<bool> DeleteAsync(int id);
}
