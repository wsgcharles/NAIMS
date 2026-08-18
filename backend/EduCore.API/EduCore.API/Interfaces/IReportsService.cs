using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IReportsService
{
    Task<ReportsOverviewResponse> GetOverviewAsync();
    Task<List<StudentReportItem>> GetStudentReportAsync();
    Task<List<TeacherReportItem>> GetTeacherReportAsync();
    Task<List<FinanceReportItem>> GetFinanceReportAsync();
    Task<List<GradeReportItem>> GetGradeReportAsync();
    Task<List<EnrollmentTrendDto>> GetEnrollmentTrendsAsync();
}
