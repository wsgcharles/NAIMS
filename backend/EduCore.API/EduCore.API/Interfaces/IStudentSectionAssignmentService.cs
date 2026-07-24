using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IStudentSectionAssignmentService
{
    Task<List<StudentSectionAssignmentResponse>> GetAllAsync();

    Task<StudentSectionAssignmentResponse?> GetByIdAsync(int id);

    Task<StudentSectionAssignmentResponse> CreateAsync(
        CreateStudentSectionAssignmentRequest request);

    Task<StudentSectionAssignmentResponse?> UpdateAsync(
        int id,
        UpdateStudentSectionAssignmentRequest request);

    Task<bool> DeleteAsync(int id);
}