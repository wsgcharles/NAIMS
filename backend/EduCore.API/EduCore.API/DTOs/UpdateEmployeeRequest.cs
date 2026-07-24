using System.ComponentModel.DataAnnotations;
using EduCore.API.Models;

namespace EduCore.API.DTOs;

public class UpdateEmployeeRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    public string MiddleName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string Suffix { get; set; } = string.Empty;

    [Required]
    public DateTime BirthDate { get; set; }

    [Required]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string Barangay { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Province { get; set; } = string.Empty;


    [Required]
    public string Position { get; set; } = string.Empty;

    [Required]
    public DateTime DateHired { get; set; }

    
}