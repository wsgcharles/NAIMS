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

    [Required]
    public string Relationship { get; set; } = string.Empty;

    // Academic
    [Required]
    public string PreviousSchool { get; set; } = string.Empty;

    [Required]
    public string GradeApplyingFor { get; set; } = string.Empty;

    // Uploaded Documents
    public string? BirthCertificatePath { get; set; }

    public string? ReportCardPath { get; set; }

    public string? GoodMoralPath { get; set; }

    // Status
    public EnrollmentApplicationStatus Status { get; set; }

    public bool IsApproved { get; set; } = false;

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}