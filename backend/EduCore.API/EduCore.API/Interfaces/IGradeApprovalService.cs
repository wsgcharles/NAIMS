using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IGradeApprovalService
{
    Task<List<GradeApprovalItemDto>> GetPendingApprovalsAsync();
    Task<List<GradeApprovalItemDto>> GetAllGradesForApprovalAsync(int? academicYearId, string? statusFilter);
    Task<bool> ApproveGradeAsync(int reviewerUserId, int gradeId, string? remarks);
    Task<bool> ApproveClassGradesAsync(int reviewerUserId, int teachingAssignmentId, string? remarks);
    Task<bool> RejectGradeAsync(int reviewerUserId, int gradeId, string remarks);
    Task<bool> RejectClassGradesAsync(int reviewerUserId, int teachingAssignmentId, string remarks);
    Task<bool> ReleaseClassGradesAsync(int reviewerUserId, int teachingAssignmentId);
}
