using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IStudentDashboardService
{
    Task<StudentProfileResponse?> GetProfileAsync(int userId);

    Task<List<StudentSubjectResponse>> GetSubjectsAsync(int userId);

    Task<List<StudentGradeResponse>> GetGradesAsync(int userId);
}