using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponse> CreateAsync(CreateEnrollmentRequest request);

    Task<List<EnrollmentResponse>> GetAllAsync();

    Task<EnrollmentResponse?> GetByIdAsync(int id);

    Task<EnrollmentResponse?> UpdateAsync(int id, UpdateEnrollmentRequest request);

    Task<bool> DeleteAsync(int id);

    Task<bool> ApproveAsync(int id);

    Task<bool> RejectAsync(int id);

    Task<ApproveAndEnrollResponse> ApproveAndEnrollAsync(
        int applicationId,
        ApproveAndEnrollRequest request);

    // Public Tracking & Document Pipeline
    Task<TrackApplicationResponse?> TrackApplicationAsync(string applicationNumber, string email);

    Task<bool> UpdateApplicationStageAsync(int applicationId, UpdateApplicationStageRequest request);

    Task<bool> AssignSectionAndEnrollAsync(int applicationId, AssignSectionAndEnrollRequest request);

    Task<List<EnrollmentApplicationDto>> GetPendingSectionAssignmentQueueAsync();

    Task<List<EnrollmentApplicationDto>> GetArchivedApplicationsAsync();

    // Role Analytics
    Task<RegistrarAnalyticsResponse> GetRegistrarAnalyticsAsync();

    Task<AccountingAnalyticsResponse> GetAccountingAnalyticsAsync();

    Task<PrincipalAnalyticsResponse> GetPrincipalAnalyticsAsync();

    // Returning Student Re-enrollment Pipeline
    Task<StudentEnrollmentStatusResponse> GetStudentEnrollmentStatusAsync(int userId);

    Task<bool> ConfirmStudentReEnrollmentAsync(int userId);

    Task<List<AdmissionDocumentTypeDto>> GetAdmissionDocumentTypesAsync();

    // Digital Document Management System Pipeline
    Task<UploadDocumentResponseDto> UploadDocumentAsync(
        int applicationId,
        int documentTypeId,
        Microsoft.AspNetCore.Http.IFormFile file,
        int? userId);

    Task<ApplicationDocumentDto?> GetDocumentMetadataAsync(int documentId);

    Task<(Stream fileStream, string contentType, string originalFilename)?> GetDocumentFileAsync(
        int documentId,
        string userRole,
        string? userEmail);

    Task<ApplicationDocumentDto> VerifyDocumentStatusAsync(
        int documentId,
        VerifyDocumentRequestDto request,
        int employeeId,
        string employeeRole);

    Task<ApplicationDocumentDto> VerifyOriginalDocumentStatusAsync(
        int documentId,
        VerifyOriginalDocumentRequestDto request,
        int employeeId,
        string employeeRole);

    Task<List<ApplicationDocumentDto>> GetDocumentVersionHistoryAsync(int documentId);

    // Appointment & Verification Slip Pipeline
    Task<AppointmentDto> ScheduleAppointmentAsync(int applicationId, CreateAppointmentRequestDto request, int? userId);
    Task<AppointmentDto?> GetApplicationAppointmentAsync(int applicationId);
    Task<List<AppointmentDto>> GetAppointmentQueueAsync(string? status, DateTime? date);
    Task<AppointmentDto> UpdateAppointmentStatusAsync(int appointmentId, UpdateAppointmentStatusDto request, int employeeId, string employeeRole);

    Task<VerificationSlipDto> GenerateVerificationSlipAsync(int applicationId, int employeeId, string employeeRole);
    Task<VerificationSlipDto?> GetVerificationSlipAsync(int applicationId);
}

public class AdmissionDocumentTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public string ApplicableEducationLevel { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}