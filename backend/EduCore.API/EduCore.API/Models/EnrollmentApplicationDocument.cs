using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class EnrollmentApplicationDocument
{
    public int Id { get; set; }

    public int EnrollmentApplicationId { get; set; }
    public EnrollmentApplication EnrollmentApplication { get; set; } = null!;

    public int? AdmissionDocumentTypeId { get; set; }
    public AdmissionDocumentType? AdmissionDocumentType { get; set; }

    [Required]
    [MaxLength(150)]
    public string DocumentName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Missing"; // Missing, Uploaded, Verified, Rejected

    [Required]
    [MaxLength(30)]
    public string DigitalStatus { get; set; } = "PendingUpload"; // PendingUpload, Uploaded, Verified, Rejected

    [Required]
    [MaxLength(30)]
    public string OriginalStatus { get; set; } = "NotSubmitted"; // NotSubmitted, Submitted, Verified, Rejected

    [MaxLength(250)]
    public string? Remarks { get; set; }

    [MaxLength(250)]
    public string? OriginalRemarks { get; set; }

    [MaxLength(255)]
    public string? OriginalFilename { get; set; }

    [MaxLength(255)]
    public string? StoredFilename { get; set; }

    [MaxLength(500)]
    public string? StoragePath { get; set; }

    [MaxLength(100)]
    public string? ContentType { get; set; }

    public long? FileSize { get; set; }

    public DateTime? UploadedAt { get; set; }

    public int? UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public int? VerifiedByEmployeeId { get; set; }
    public Employee? VerifiedByEmployee { get; set; }

    public DateTime? OriginalSubmittedAt { get; set; }

    public DateTime? OriginalVerifiedAt { get; set; }

    public int? OriginalVerifiedByEmployeeId { get; set; }
    public Employee? OriginalVerifiedByEmployee { get; set; }

    public int Version { get; set; } = 1;

    public bool IsActive { get; set; } = true;

    public int? ParentDocumentId { get; set; }
    public EnrollmentApplicationDocument? ParentDocument { get; set; }
}
