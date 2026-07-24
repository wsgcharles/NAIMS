using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class Payment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentNumber { get; set; } = string.Empty;

    public int StudentBillId { get; set; }
    public StudentBill StudentBill { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    [MaxLength(100)]
    public string? ReferenceNumber { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Completed;

    [MaxLength(250)]
    public string? Remarks { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public int ProcessedByEmployeeId { get; set; }
    public Employee ProcessedBy { get; set; } = null!;

    public int? ProcessedByUserId { get; set; }
    public User? ProcessedByUser { get; set; }

    public OfficialReceipt? OfficialReceipt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
