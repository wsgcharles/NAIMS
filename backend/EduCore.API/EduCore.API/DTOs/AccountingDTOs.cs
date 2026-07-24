using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.DTOs;

public class CreateSchoolFeeRequest
{
    [Required]
    [MaxLength(100)]
    public string FeeName { get; set; } = string.Empty;

    public FeeType FeeType { get; set; } = FeeType.Tuition;

    [Range(0, 1000000)]
    public decimal Amount { get; set; }

    [Required]
    public int AcademicYearId { get; set; }

    public int? GradeLevelId { get; set; }

    public bool IsMandatory { get; set; } = true;
}

public class UpdateSchoolFeeRequest : CreateSchoolFeeRequest
{
    public bool IsActive { get; set; } = true;
}

public class SchoolFeeResponse
{
    public int Id { get; set; }
    public string FeeName { get; set; } = string.Empty;
    public string FeeType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public int? GradeLevelId { get; set; }
    public string? GradeLevelName { get; set; }
    public bool IsMandatory { get; set; }
    public bool IsActive { get; set; }
}

public class StudentBillItemResponse
{
    public int Id { get; set; }
    public int? SchoolFeeId { get; set; }
    public string FeeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal NetAmount => Amount - DiscountAmount;
    public string? Notes { get; set; }
}

public class StudentBillResponse
{
    public int Id { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public int EnrollmentId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string GradeLevelName { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? DiscountRemarks { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<StudentBillItemResponse> Items { get; set; } = new();
    public List<PaymentResponse> Payments { get; set; } = new();
}

public class ProcessPaymentRequest
{
    [Required]
    public int StudentBillId { get; set; }

    [Range(0.01, 1000000)]
    public decimal Amount { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    [MaxLength(100)]
    public string? ReferenceNumber { get; set; }

    [MaxLength(250)]
    public string? Remarks { get; set; }

    [Required]
    public int ProcessedByEmployeeId { get; set; }

    public int? ProcessedByUserId { get; set; }
}

public class PaymentResponse
{
    public int Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public int StudentBillId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime PaymentDate { get; set; }
    public int ProcessedByEmployeeId { get; set; }
    public string ProcessedByName { get; set; } = string.Empty;
    public OfficialReceiptResponse? Receipt { get; set; }
}

public class OfficialReceiptResponse
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal TotalAmountPaid { get; set; }
    public string PayerName { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public string IssuedByName { get; set; } = string.Empty;
    public bool IsCancelled { get; set; }
    public string? CancellationReason { get; set; }
}

public class AccountingDashboardResponse
{
    public decimal TodayCollection { get; set; }
    public decimal MonthlyCollection { get; set; }
    public decimal TotalOutstandingBalances { get; set; }
    public int PaidStudentsCount { get; set; }
    public int UnpaidStudentsCount { get; set; }
    public int PendingBillsCount { get; set; }
    public List<PaymentResponse> RecentPayments { get; set; } = new();
}

public class LedgerTransactionDto
{
    public DateTime Date { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Debit (Bill) / Credit (Payment)
    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class StudentLedgerResponse
{
    public int StudentId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string GradeLevelName { get; set; } = string.Empty;
    public decimal TotalBilled { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal CurrentBalance { get; set; }
    public List<LedgerTransactionDto> Transactions { get; set; } = new();
}
