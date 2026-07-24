using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class Parent
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string MiddleName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Occupation { get; set; } = string.Empty;

    [Required]
    public string RelationshipToStudent { get; set; } = string.Empty;

    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Student> Students { get; set; }
        = new List<Student>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;
}