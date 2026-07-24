public class EmployeeResponse
{
    public int Id { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public DateTime DateHired { get; set; }

    public bool IsActive { get; set; }

    
    public string? TemporaryPassword { get; set; }
}