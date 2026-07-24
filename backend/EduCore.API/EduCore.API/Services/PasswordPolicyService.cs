using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using EduCore.API.Interfaces;

namespace EduCore.API.Services;

public class PasswordPolicyService : IPasswordPolicyService
{
    private static readonly char[] UppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ".ToCharArray();
    private static readonly char[] LowercaseChars = "abcdefghijkmnopqrstuvwxyz".ToCharArray();
    private static readonly char[] DigitChars = "23456789".ToCharArray();
    private static readonly char[] SpecialChars = "!@#$%^&*".ToCharArray();

    public (bool IsValid, string? ErrorMessage) ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return (false, "Password must be at least 8 characters long.");

        if (!password.Any(char.IsUpper))
            return (false, "Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsLower))
            return (false, "Password must contain at least one lowercase letter.");

        if (!password.Any(char.IsDigit))
            return (false, "Password must contain at least one digit.");

        if (!Regex.IsMatch(password, @"[!@#$%^&*()_+=\[{\]};:<>|./?,-]"))
            return (false, "Password must contain at least one special character (!@#$%^&* etc.).");

        return (true, null);
    }

    public string HashResetToken(string rawToken)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(rawToken);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    public bool VerifyResetToken(string rawToken, string hashedToken)
    {
        var computedHash = HashResetToken(rawToken);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computedHash),
            Encoding.UTF8.GetBytes(hashedToken));
    }

    public string GenerateRandomPassword(int length = 10)
    {
        if (length < 8) length = 10;

        var result = new char[length];
        var allChars = UppercaseChars.Concat(LowercaseChars).Concat(DigitChars).Concat(SpecialChars).ToArray();

        result[0] = GetRandomChar(UppercaseChars);
        result[1] = GetRandomChar(LowercaseChars);
        result[2] = GetRandomChar(DigitChars);
        result[3] = GetRandomChar(SpecialChars);

        for (int i = 4; i < length; i++)
        {
            result[i] = GetRandomChar(allChars);
        }

        // Shuffle result securely
        for (int i = result.Length - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (result[i], result[j]) = (result[j], result[i]);
        }

        return new string(result);
    }

    private static char GetRandomChar(char[] charSet)
    {
        int index = RandomNumberGenerator.GetInt32(charSet.Length);
        return charSet[index];
    }
}
