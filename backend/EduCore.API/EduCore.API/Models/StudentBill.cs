using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class StudentBill
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string BillNumber { get; set; } = string.Empty;

    public int EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [MaxLength(200)]
    public string? DiscountRemarks { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }

    [NotMapped]
    public decimal Balance => TotalAmount - AmountPaid;

    public BillStatus Status { get; set; } = BillStatus.Pending;

    public DateTime DueDate { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public ICollection<StudentBillItem> BillItems { get; set; } = new List<StudentBillItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
