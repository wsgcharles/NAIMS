using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ISectionService
{
    Task<List<SectionResponse>> GetAllAsync();

    Task<SectionResponse?> GetByIdAsync(int id);

    Task<SectionResponse> CreateAsync(CreateSectionRequest request);

    Task<SectionResponse?> UpdateAsync(int id, UpdateSectionRequest request);

    Task<bool> DeleteAsync(int id);
}