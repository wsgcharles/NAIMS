using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class SchoolSetting
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string SchoolName { get; set; } = "Noah's Academy";

    [MaxLength(500)]
    public string? SchoolLogoUrl { get; set; }

    public int? CurrentAcademicYearId { get; set; }
    public AcademicYear? CurrentAcademicYear { get; set; }

    [MaxLength(20)]
    public string OfficialReceiptPrefix { get; set; } = "OR-";

    /// <summary>Configurable prefix for student numbers (e.g. "NAI").</summary>
    [MaxLength(20)]
    public string StudentNumberPrefix { get; set; } = "NAI";

    /// <summary>Number of zero-padded digits in the running counter (e.g. 6 → 000001).</summary>
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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
