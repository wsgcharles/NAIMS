using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAttendanceService
{
    Task<List<AttendanceRosterEntryResponse>> GetRosterAsync(int teachingAssignmentId, DateTime date);

    Task<List<AttendanceResponse>> SubmitAsync(SubmitAttendanceRequest request);

    Task<List<AttendanceResponse>> GetByStudentIdAsync(int studentId);

    Task<AttendanceSummaryResponse> GetSummaryByStudentIdAsync(int studentId);

    Task<int?> GetStudentIdByUserIdAsync(int userId);
}
