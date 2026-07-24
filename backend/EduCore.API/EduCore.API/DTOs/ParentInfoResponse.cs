namespace EduCore.API.DTOs;

public class ParentInfoResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string Occupation { get; set; } = "";
    public string RelationshipToStudent { get; set; } = "";
}