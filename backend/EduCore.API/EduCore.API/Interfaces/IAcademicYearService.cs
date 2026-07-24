using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAcademicYearService
{
    Task<List<AcademicYearResponse>> GetAllAsync();

    Task<AcademicYearResponse?> GetByIdAsync(int id);

    Task<AcademicYearResponse> CreateAsync(CreateAcademicYearRequest request);

    Task<AcademicYearResponse?> UpdateAsync(
        int id,
        UpdateAcademicYearRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> SetActiveAsync(int id);
}