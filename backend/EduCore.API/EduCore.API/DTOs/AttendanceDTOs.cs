using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class AttendanceResponse
{
    public int Id { get; set; }

    public int TeachingAssignmentId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public int StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public string? RecordedByName { get; set; }
}

public class AttendanceRosterEntryResponse
{
    public int StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string? Status { get; set; }

    public string? Remarks { get; set; }
}

public class MarkAttendanceEntry
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Remarks { get; set; }
}

public class SubmitAttendanceRequest
{
    [Required]
    public int TeachingAssignmentId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public int RecordedByEmployeeId { get; set; }

    [Required]
    public List<MarkAttendanceEntry> Entries { get; set; } = new();
}

public class AttendanceSummaryResponse
{
    public int StudentId { get; set; }

    public int TotalDaysRecorded { get; set; }

    public int PresentDays { get; set; }

    public int TardyDays { get; set; }

    public int AbsentDays { get; set; }

    public int ExcusedDays { get; set; }

    public decimal AttendanceRate { get; set; }
}

public class TeacherClassResponse
{
    public int ClassId { get; set; }
    public int TeachingAssignmentId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
    public int StudentCount { get; set; }
}

public class TeacherAttendanceDashboardSummary
{
    public int PresentCount { get; set; }
    public int TardyCount { get; set; }
    public int AbsentCount { get; set; }
    public int TotalStudents { get; set; }
    public DateTime Date { get; set; }
}

public class TeacherStudentRosterEntry
{
    public int StudentId { get; set; }
    public string Lrn { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string? Status { get; set; }
    public string? Remarks { get; set; }
}

public class SaveTeacherAttendanceRequest
{
    [Required]
    public int ClassId { get; set; }
    public DateTime? Date { get; set; }
    public List<MarkAttendanceEntry> Entries { get; set; } = new();
}
