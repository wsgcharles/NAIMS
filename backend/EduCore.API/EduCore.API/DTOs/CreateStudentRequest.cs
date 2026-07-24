using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateStudentRequest
{
    [Required]
    [MaxLength(12)]
    public string LRN { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    public string MiddleName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string Suffix { get; set; } = string.Empty;

    public DateTime BirthDate { get; set; }

    public string Gender { get; set; } = string.Empty;

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Barangay { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Province { get; set; } = string.Empty;

    public int? ParentId { get; set; }
}