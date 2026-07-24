using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IAccountingService
{
    // School Fees
    Task<List<SchoolFeeResponse>> GetSchoolFeesAsync(int? academicYearId, int? gradeLevelId);
    Task<SchoolFeeResponse?> GetSchoolFeeByIdAsync(int id);
    Task<SchoolFeeResponse> CreateSchoolFeeAsync(CreateSchoolFeeRequest request);
    Task<SchoolFeeResponse?> UpdateSchoolFeeAsync(int id, UpdateSchoolFeeRequest request);
    Task<bool> DeleteSchoolFeeAsync(int id);

    // Bills & Generation
    Task<StudentBillResponse> GenerateBillForEnrollmentAsync(int enrollmentId, int? createdByUserId = null);
    Task<StudentBillResponse?> GetBillByIdAsync(int id);
    Task<List<StudentBillResponse>> GetBillsByStudentIdAsync(int studentId);

    // Payments & Receipts
    Task<PaymentResponse> ProcessPaymentAsync(ProcessPaymentRequest request);
    Task<PaymentResponse?> GetPaymentByIdAsync(int id);
    Task<List<PaymentResponse>> GetPaymentsByStudentIdAsync(int studentId);
    Task<OfficialReceiptResponse?> GetReceiptByPaymentIdAsync(int paymentId);
    Task<List<OfficialReceiptResponse>> GetReceiptsByStudentIdAsync(int studentId);

    // Ledger & Dashboard
    Task<StudentLedgerResponse> GetStudentLedgerAsync(int studentId);
    Task<AccountingDashboardResponse> GetAccountingDashboardAsync();
}
