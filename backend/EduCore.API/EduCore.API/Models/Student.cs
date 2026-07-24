using EduCore.API.Enums;
using System.ComponentModel.DataAnnotations;
namespace EduCore.API.Models;

public class Student
{
    public int Id { get; set; }

    [Required]
    [MaxLength(12)]
    public string LRN { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string StudentNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string MiddleName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Suffix { get; set; } = string.Empty;

    public DateTime BirthDate { get; set; }

    [Required]

    public Gender Gender { get; set; }

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string Barangay { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Province { get; set; } = string.Empty;

    [MaxLength(10)]
    public string ZipCode { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    public Parent? Parent { get; set; }

    public StudentStatus Status { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }
    public ICollection<Enrollment> Enrollments { get; set; }
    = new List<Enrollment>();
    public ICollection<StudentHistory> Histories { get; set; }
    = new List<StudentHistory>();

    public ICollection<StudentSectionAssignment> SectionAssignments { get; set; }
    = new List<StudentSectionAssignment>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}