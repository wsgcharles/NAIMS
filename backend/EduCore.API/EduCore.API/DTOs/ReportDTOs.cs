namespace EduCore.API.DTOs;

public class ReportsOverviewResponse
{
    public int AvailableTemplatesCount { get; set; } = 4;
    public int GeneratedThisMonthCount { get; set; }
    public int TotalActiveStudents { get; set; }
    public int TotalActiveEmployees { get; set; }
    public decimal TotalRevenueCollected { get; set; }
    public decimal TotalOutstandingBalance { get; set; }
}

public class StudentReportItem
{
    public int StudentId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class TeacherReportItem
{
    public int EmployeeId { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class FinanceReportItem
{
    public int TransactionId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
}

public class GradeReportItem
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public double AverageGrade { get; set; }
    public double PassingRate { get; set; }
    public int EnrolledStudentsCount { get; set; }
}

public class EnrollmentTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}
