namespace EduCore.API.DTOs.ParentPortal;

public class ParentProfileResponse
{
    public int ParentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Occupation { get; set; } = string.Empty;
}
