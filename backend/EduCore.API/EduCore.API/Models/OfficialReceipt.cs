using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models;

public class OfficialReceipt
{
    public int Id { get; set; }

    public int PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string ReceiptNumber { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmountPaid { get; set; }

    [Required]
    [MaxLength(150)]
    public string PayerName { get; set; } = string.Empty;

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public int IssuedByEmployeeId { get; set; }
    public Employee IssuedBy { get; set; } = null!;

    public bool IsCancelled { get; set; } = false;

    [MaxLength(250)]
    public string? CancellationReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
