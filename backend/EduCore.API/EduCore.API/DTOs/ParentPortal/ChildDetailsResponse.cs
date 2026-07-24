using EduCore.API.DTOs;

namespace EduCore.API.DTOs.ParentPortal;

public class ChildDetailsResponse : ChildSummaryResponse
{
    public string BirthDate { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
