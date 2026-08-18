using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class TrackApplicationRequest
{
    [Required]
    public string ApplicationNumber { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ApplicationDocumentDto
{
    public int Id { get; set; }
    public int? AdmissionDocumentTypeId { get; set; }
    public string DocumentName { get; set; } = string.Empty;
    public string Status { get; set; } = "Missing"; // Legacy Status mapping
    public string DigitalStatus { get; set; } = "PendingUpload"; // PendingUpload, Uploaded, Verified, Rejected
    public string OriginalStatus { get; set; } = "NotSubmitted"; // NotSubmitted, Submitted, Verified, Rejected
    public string? Remarks { get; set; }
    public string? OriginalRemarks { get; set; }
    public string? OriginalFilename { get; set; }
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }
    public DateTime? UploadedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? OriginalSubmittedAt { get; set; }
    public DateTime? OriginalVerifiedAt { get; set; }
    public int Version { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public string? DownloadUrl { get; set; }
    public string? PreviewUrl { get; set; }
}

public class UploadDocumentResponseDto
{
    public int Id { get; set; }
    public int EnrollmentApplicationId { get; set; }
    public int? AdmissionDocumentTypeId { get; set; }
    public string DocumentName { get; set; } = string.Empty;
    public string OriginalFilename { get; set; } = string.Empty;
    public string StoredFilename { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string Status { get; set; } = "Uploaded";
    public string DigitalStatus { get; set; } = "Uploaded";
    public string OriginalStatus { get; set; } = "NotSubmitted";
    public int Version { get; set; } = 1;
    public string DownloadUrl { get; set; } = string.Empty;
    public string PreviewUrl { get; set; } = string.Empty;
}

public class VerifyDocumentRequestDto
{
    public int DocumentId { get; set; }
    public string Status { get; set; } = "Verified"; // Verified, Rejected, Missing
    public string? Remarks { get; set; }
}

public class VerifyOriginalDocumentRequestDto
{
    public int DocumentId { get; set; }
    public string Status { get; set; } = "Verified"; // NotSubmitted, Submitted, Verified, Rejected
    public string? Remarks { get; set; }
}

public class StatusHistoryDto
{
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; }
}

public class TrackApplicationResponse
{
    public int Id { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string GradeApplyingFor { get; set; } = string.Empty;
    public string? Track { get; set; }
    public string? Strand { get; set; }
    public string Status { get; set; } = string.Empty;
    public int StageIndex { get; set; }
    public string CurrentStageTitle { get; set; } = string.Empty;
    public string EstimatedNextStep { get; set; } = string.Empty;
    public string? ApplicantRemarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool HasRegistrarVerificationSlip { get; set; } = false;
    public string? VerificationSlipNumber { get; set; }
    public DateTime? VerificationSlipGeneratedAt { get; set; }
    public AppointmentDto? Appointment { get; set; }
    public List<ApplicationDocumentDto> Documents { get; set; } = new();
    public List<StatusHistoryDto> StatusHistory { get; set; } = new();
}

public class CreateAppointmentRequestDto
{
    public DateTime AppointmentDate { get; set; }
    public string AppointmentTime { get; set; } = "9:00 AM";
    public string? Remarks { get; set; }
}

public class UpdateAppointmentStatusDto
{
    public string Status { get; set; } = "Confirmed"; // Pending, Confirmed, Completed, Missed, Cancelled, Rescheduled
    public DateTime? AppointmentDate { get; set; }
    public string? AppointmentTime { get; set; }
    public string? Remarks { get; set; }
}

public class AppointmentDto
{
    public int Id { get; set; }
    public int EnrollmentApplicationId { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;
    public string ApplicantName { get; set; } = string.Empty;
    public string GradeApplyingFor { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string AppointmentTime { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VerificationSlipDto
{
    public string ApplicationNumber { get; set; } = string.Empty;
    public string ApplicantName { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
    public string SchoolYear { get; set; } = "SY 2026-2027";
    public DateTime VerificationDate { get; set; }
    public string VerificationSlipNumber { get; set; } = string.Empty;
    public string QrCodeContent { get; set; } = string.Empty;
    public string VerifiedByRegistrarName { get; set; } = "Registrar Office";
    public List<string> VerifiedDocuments { get; set; } = new List<string>();
}

public class UpdateApplicationStageRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? ApplicantRemarks { get; set; }
    public string? InternalNotes { get; set; }

    public List<UpdateDocumentStatusItem>? Documents { get; set; }
}

public class UpdateDocumentStatusItem
{
    public int DocumentId { get; set; }
    public string Status { get; set; } = "Missing"; // Missing, Received, Verified
    public string? Remarks { get; set; }
}

public class AssignSectionAndEnrollRequest
{
    [Required]
    public int SectionId { get; set; }

    public int EmployeeId { get; set; }

    public string LRN { get; set; } = string.Empty;

    public EduCore.API.Enums.EnrollmentType EnrollmentType { get; set; }

    public bool CreateParentPortal { get; set; } = true;

    public int AcademicYearId { get; set; }



    public int GradeLevelId { get; set; }

    public int? AdviserEmployeeId { get; set; }

    public string? Homeroom { get; set; }
}



public class RegistrarAnalyticsResponse
{
    public int SubmittedToday { get; set; }
    public int SubmittedThisWeek { get; set; }
    public int UnderReview { get; set; }
    public int DocumentsPending { get; set; }
    public int AssessmentsPending { get; set; }
    public int EnrolledStudents { get; set; }
    public int RejectedApplications { get; set; }
    public double AverageProcessingTimeHours { get; set; }
    public double ConversionRatePercentage { get; set; }
}

public class AccountingAnalyticsResponse
{
    public int PendingAssessments { get; set; }
    public decimal PaymentsToday { get; set; }
    public decimal OutstandingBalances { get; set; }
    public int OfficialReceiptsIssuedToday { get; set; }
}

public class PrincipalAnalyticsResponse
{
    public int TotalEnrollment { get; set; }
    public int NewStudentsCount { get; set; }
    public int ReturningStudentsCount { get; set; }
    public Dictionary<string, int> EnrollmentByGradeLevel { get; set; } = new();
}

public class StudentEnrollmentStatusResponse
{
    public string SchoolYear { get; set; } = string.Empty;
    public bool IsEnrollmentOpen { get; set; }
    public string EnrollmentPeriodText { get; set; } = string.Empty;
    public string Status { get; set; } = "Eligible";
    public bool CanEnrollNow { get; set; }
    public string AssessmentStatus { get; set; } = "Pending";
    public string PaymentStatus { get; set; } = "Pending";
    public string SectionStatus { get; set; } = "Not Yet Assigned";
    public string? SectionName { get; set; }
}

public class EnrollmentApplicationDto
{
    public int Id { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Suffix { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public DateTime BirthDate { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string ParentContact { get; set; } = string.Empty;
    public string? ParentEmail { get; set; }
    public string Relationship { get; set; } = string.Empty;

    public string PreviousSchool { get; set; } = string.Empty;
    public string GradeApplyingFor { get; set; } = string.Empty;
    public string? Track { get; set; }
    public string? Strand { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasRegistrarVerificationSlip { get; set; }
    public string? VerificationSlipNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ApplicationDocumentDto> Documents { get; set; } = new();
}
