using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ITeachingAssignmentService
{
    Task<List<TeachingAssignmentResponse>> GetAllAsync();

    Task<TeachingAssignmentResponse?> GetByIdAsync(int id);

    Task<TeachingAssignmentResponse> CreateAsync(CreateTeachingAssignmentRequest request);

    Task<TeachingAssignmentResponse?> UpdateAsync(int id, UpdateTeachingAssignmentRequest request);

    Task<bool> DeleteAsync(int id);
}