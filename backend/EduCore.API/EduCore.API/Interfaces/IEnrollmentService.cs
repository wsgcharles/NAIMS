using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponse> CreateAsync(CreateEnrollmentRequest request);

    Task<List<EnrollmentResponse>> GetAllAsync();

    Task<EnrollmentResponse?> GetByIdAsync(int id);

    Task<EnrollmentResponse?> UpdateAsync(int id, UpdateEnrollmentRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> ApproveAsync(int id);

    Task<bool> RejectAsync(int id);

    /// <summary>
    /// Approves an enrollment application AND automatically creates the Student record
    /// and User account with a temporary password. Called by the Registrar after
    /// reviewing the applicant's documents and confirming their LRN.
    /// </summary>
    Task<ApproveAndEnrollResponse> ApproveAndEnrollAsync(
        int applicationId,
        ApproveAndEnrollRequest request);
}