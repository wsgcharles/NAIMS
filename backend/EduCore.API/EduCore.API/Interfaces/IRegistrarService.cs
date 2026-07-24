using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IRegistrarService
{
    Task<List<StudentListResponse>> GetStudentsAsync();

    Task<StudentRecordResponse?> GetStudentByIdAsync(int studentId);

    Task<bool> PromoteStudentAsync(PromoteStudentRequest request);

    Task<bool> TransferStudentAsync(TransferStudentRequest request);

    Task<bool> GraduateStudentAsync(GraduateStudentRequest request);
}