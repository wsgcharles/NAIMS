using EduCore.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class EnrollmentApplication
{
    public int Id { get; set; }

    // Application Number
    [Required]
    public string ApplicationNumber { get; set; } = string.Empty;

    // Student Information
    [Required]
    public string FirstName { get; set; } = string.Empty;

    public string MiddleName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string Suffix { get; set; } = string.Empty;

    [Required]
    public DateTime BirthDate { get; set; }

    [Required]
    public Gender Gender { get; set; }

    // Contact
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    // Address
    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string Barangay { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Province { get; set; } = string.Empty;

    // Parent
    [Required]
    public string ParentName { get; set; } = string.Empty;

    [Required]
    public string ParentContact { get; set; } = string.Empty;

    [EmailAddress]
    public string? ParentEmail { get; set; }

    [Required]
    public string Relationship { get; set; } = string.Empty;


    // Academic
    [Required]
    public string PreviousSchool { get; set; } = string.Empty;

    [Required]
    public string GradeApplyingFor { get; set; } = string.Empty;

    public string? Track { get; set; }

    public string? Strand { get; set; }


    // Uploaded Documents
    public string? BirthCertificatePath { get; set; }

    public string? ReportCardPath { get; set; }

    public string? GoodMoralPath { get; set; }

    // Status & Notes Isolation
    public EnrollmentApplicationStatus Status { get; set; } = EnrollmentApplicationStatus.Submitted;

    public bool IsApproved { get; set; } = false;

    /// <summary>
    /// Public remarks sent to the applicant (visible on tracking UI & included in status emails).
    /// </summary>
    public string? ApplicantRemarks { get; set; }

    /// <summary>
    /// Private staff-only notes (Registrar/Admin internal notes; NEVER exposed to public tracking API).
    /// </summary>
    public string? InternalNotes { get; set; }

    /// <summary>
    /// Student record created upon Approved stage (before Accounting assessment).
    /// </summary>
    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    // Verification Slip & Dual Verification Completion Metadata
    public bool HasRegistrarVerificationSlip { get; set; } = false;
    public DateTime? VerificationSlipGeneratedAt { get; set; }
    [MaxLength(100)]
    public string? VerificationSlipNumber { get; set; }
    [MaxLength(500)]
    public string? VerificationSlipQrCode { get; set; }

    public ICollection<EnrollmentApplicationDocument> Documents { get; set; }
        = new List<EnrollmentApplicationDocument>();

    public ICollection<DocumentSubmissionAppointment> Appointments { get; set; }
        = new List<DocumentSubmissionAppointment>();

    public ICollection<ApplicationStatusHistory> StatusHistories { get; set; }
        = new List<ApplicationStatusHistory>();

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}