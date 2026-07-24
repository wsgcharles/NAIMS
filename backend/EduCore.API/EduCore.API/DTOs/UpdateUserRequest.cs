using System.ComponentModel.DataAnnotations;
using EduCore.API.Models;

namespace EduCore.API.DTOs;

public class UpdateUserRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}