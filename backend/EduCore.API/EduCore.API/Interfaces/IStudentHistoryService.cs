using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IStudentHistoryService
{
    Task AddHistoryAsync(CreateStudentHistoryRequest request);

    Task<List<StudentHistoryResponse>> GetByStudentIdAsync(int studentId);
}