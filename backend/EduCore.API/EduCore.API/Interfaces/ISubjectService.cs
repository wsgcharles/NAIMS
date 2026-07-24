using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ISubjectService
{
    Task<List<SubjectResponse>> GetAllAsync();

    Task<SubjectResponse?> GetByIdAsync(int id);

    Task<SubjectResponse> CreateAsync(CreateSubjectRequest request);

    Task<SubjectResponse?> UpdateAsync(int id, UpdateSubjectRequest request);

    Task<bool> DeleteAsync(int id);
}   