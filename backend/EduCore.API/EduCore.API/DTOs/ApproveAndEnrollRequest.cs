using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class ApproveAndEnrollRequest
{
    /// <summary>
    /// The student's Learner Reference Number (LRN).
    /// Verified by the Registrar from the submitted documents.
    /// </summary>
    [Required]
    [MaxLength(12)]
    public string LRN { get; set; } = string.Empty;

    /// <summary>
    /// The Registrar or Administrator who is approving this application.
    /// </summary>
    [Required]
    public int EmployeeId { get; set; }

    /// <summary>
    /// The section to assign the student to.
    /// </summary>
    [Required]
    public int SectionId { get; set; }

    /// <summary>
    /// The enrollment type (New, Regular, Transferee, Returnee).
    /// </summary>
    [Required]
    public EduCore.API.Enums.EnrollmentType EnrollmentType { get; set; }
}
