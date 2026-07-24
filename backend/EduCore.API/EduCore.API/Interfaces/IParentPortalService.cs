using EduCore.API.DTOs;
using EduCore.API.DTOs.ParentPortal;

namespace EduCore.API.Interfaces;

public interface IParentPortalService
{
    Task<int?> GetParentIdByUserIdAsync(int userId);
    Task<ParentProfileResponse?> GetProfileAsync(int parentId);
    Task<List<ChildSummaryResponse>> GetChildrenAsync(int parentId);
    Task<ChildDetailsResponse?> GetChildDetailsAsync(int parentId, int studentId);
    Task<List<ChildSubjectResponse>> GetChildSubjectsAsync(int parentId, int studentId, int academicYearId);
    Task<List<ChildGradeResponse>> GetChildGradesAsync(int parentId, int studentId, int academicYearId);
    Task<List<EnrollmentResponse>> GetChildEnrollmentsAsync(int parentId, int studentId);
}
