using System.ComponentModel.DataAnnotations;
namespace EduCore.API.Models;

public class Employee
{
    public int Id { get; set; }

    // Employee Number
    [Required]
    [MaxLength(20)]
    public string EmployeeNumber { get; set; } = string.Empty;

    // Personal Information
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

    [Required]
    public DateTime BirthDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    // Contact Information
    [Required]
    [MaxLength(20)]
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

    
    [Required]
    public string Department { get; set; } = string.Empty;

    [Required]
    public string Position { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    [Required]
    public DateTime DateHired { get; set; }

    public bool IsActive { get; set; } = true;

    
    public int? UserId { get; set; }

    public User? User { get; set; }

    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
    = new List<TeachingAssignment>();
    public ICollection<Section> AdvisorySections { get; set; }
    = new List<Section>();
    
}