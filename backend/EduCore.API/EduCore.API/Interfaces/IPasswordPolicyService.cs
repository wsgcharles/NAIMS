namespace EduCore.API.Interfaces;

public interface IPasswordPolicyService
{
    (bool IsValid, string? ErrorMessage) ValidatePasswordStrength(string password);
    string HashResetToken(string rawToken);
    bool VerifyResetToken(string rawToken, string hashedToken);
    string GenerateRandomPassword(int length = 10);
}
