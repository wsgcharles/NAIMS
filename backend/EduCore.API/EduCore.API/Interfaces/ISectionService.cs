using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ISectionService
{
    Task<List<SectionResponse>> GetAllAsync();

    Task<SectionResponse?> GetByIdAsync(int id);

    Task<SectionResponse> CreateAsync(CreateSectionRequest request);

    Task<SectionResponse?> UpdateAsync(int id, UpdateSectionRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> ToggleStatusAsync(int id);

    Task<SectionManagementStatsDto> GetStatsAsync();

    Task<bool> AssignTeacherAsync(int sectionId, AssignSectionTeacherRequest request);

    Task<bool> AssignSubjectsAsync(int sectionId, AssignSectionSubjectsRequest request);

    Task<List<AvailableSectionResponse>> GetAvailableSectionsForEnrollmentAsync(int applicationId);

    Task<SectionValidationResultDto> ValidateSectionForEnrollmentAsync(int applicationId, int sectionId);
}