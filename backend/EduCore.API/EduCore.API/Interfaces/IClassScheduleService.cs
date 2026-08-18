using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IClassScheduleService
{
    Task<List<ClassScheduleResponse>> GetAllAsync();

    Task<List<ClassScheduleResponse>> GetByTeachingAssignmentAsync(int teachingAssignmentId);

    Task<List<ClassScheduleResponse>> GetByStudentIdAsync(int studentId);

    Task<List<ClassScheduleResponse>> GetByTeacherUserIdAsync(int userId);

    Task<int?> GetStudentIdByUserIdAsync(int userId);

    Task<ClassScheduleResponse> CreateAsync(CreateClassScheduleRequest request);

    Task<ClassScheduleResponse?> UpdateAsync(int id, UpdateClassScheduleRequest request);

    Task<bool> DeleteAsync(int id);
}
