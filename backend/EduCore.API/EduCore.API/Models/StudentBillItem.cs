using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models;

public class StudentBillItem
{
    public int Id { get; set; }

    public int StudentBillId { get; set; }
    public StudentBill StudentBill { get; set; } = null!;

    public int? SchoolFeeId { get; set; }
    public SchoolFee? SchoolFee { get; set; }

    [Required]
    [MaxLength(100)]
    public string FeeName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [MaxLength(200)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
