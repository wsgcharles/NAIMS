namespace EduCore.API.DTOs;

public class StudentResponse
{
    public int Id { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public string LRN { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string MiddleName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Suffix { get; set; } = string.Empty;

    public DateTime BirthDate { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Barangay { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Province { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    public bool IsActive { get; set; }

    public string? TemporaryPassword { get; set; }
}
