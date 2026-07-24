namespace EduCore.API.DTOs;

public class PersonalInfoResponse
{
    public string StudentNumber { get; set; } = "";

    public string LRN { get; set; } = "";

    public string FirstName { get; set; } = "";

    public string MiddleName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PhoneNumber { get; set; } = "";

    public string Address { get; set; } = "";

    public string Barangay { get; set; } = "";

    public string City { get; set; } = "";

    public string Province { get; set; } = "";

    public bool IsActive { get; set; }
}