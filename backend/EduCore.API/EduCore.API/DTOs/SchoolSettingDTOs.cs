using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class SchoolSettingResponse
{
    public int Id { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string? SchoolLogoUrl { get; set; }
    public int? CurrentAcademicYearId { get; set; }
    public string? CurrentAcademicYearName { get; set; }
    public string OfficialReceiptPrefix { get; set; } = string.Empty;
    public string StudentNumberPrefix { get; set; } = string.Empty;
    public int StudentNumberCounterLength { get; set; } = 6;
    public string BillNumberPrefix { get; set; } = string.Empty;
    public string PaymentNumberPrefix { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
}

public class UpdateSchoolSettingRequest
{
    [Required]
    [MaxLength(150)]
    public string SchoolName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? SchoolLogoUrl { get; set; }

    public int? CurrentAcademicYearId { get; set; }

    [MaxLength(20)]
    public string OfficialReceiptPrefix { get; set; } = "OR-";

    [MaxLength(20)]
    public string StudentNumberPrefix { get; set; } = "NAI";

    public int StudentNumberCounterLength { get; set; } = 6;

    [MaxLength(20)]
    public string BillNumberPrefix { get; set; } = "BILL-";

    [MaxLength(20)]
    public string PaymentNumberPrefix { get; set; } = "PAY-";

    [MaxLength(10)]
    public string Currency { get; set; } = "PHP";

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ContactPhone { get; set; } = string.Empty;
}
