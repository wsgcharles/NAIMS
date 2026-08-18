namespace EduCore.API.DTOs;

public class EmailItem
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public object ViewModel { get; set; } = null!;
}

public class BaseEmailViewModel
{
    public string SchoolName { get; set; } = "Noah's Academy";
    public string? SchoolLogoUrl { get; set; }
    public string SchoolAddress { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Currency { get; set; } = "PHP";
}

public class EmployeeWelcomeEmailViewModel : BaseEmailViewModel
{
    public string EmployeeName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
}

public class StudentWelcomeEmailViewModel : BaseEmailViewModel
{
    public string StudentName { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
    public string AcademicProgram { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
}

public class ParentWelcomeEmailViewModel : BaseEmailViewModel
{
    public string ParentName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
}

public class PasswordResetEmailViewModel : BaseEmailViewModel
{
    public string RecipientName { get; set; } = string.Empty;
    public string VerificationCode { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 15;
}

public class PaymentReceiptEmailViewModel : BaseEmailViewModel
{
    public string PayerName { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public DateTime PaymentDate { get; set; }
}
