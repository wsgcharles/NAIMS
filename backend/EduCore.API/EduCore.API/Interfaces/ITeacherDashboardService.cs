using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ITeacherDashboardService
{
    Task<List<MyClassResponse>> GetMyClassesAsync(int userId);
    Task<List<StudentClassResponse>> GetStudentsAsync(int teachingAssignmentId);

    Task<List<TeacherGradeResponse>> GetGradesAsync(int teachingAssignmentId);

    Task<bool> UpdateGradeAsync(
    int userId,
    int gradeId,
    UpdateTeacherGradeRequest request);

    Task<bool> ReleaseGradesAsync(
    int userId,
    int teachingAssignmentId,
    bool isReleased);
}