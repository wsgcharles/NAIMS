using BCrypt.Net;
using EduCore.API.Interfaces;

namespace EduCore.API.Services;

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        // Work factor 12: each increment doubles brute-force cost.
        // Factor 12 is the 2025 production recommendation (~250-350ms per hash on modern hardware).
        // Chosen deliberately: imperceptible to users during login, significant barrier to offline attacks.
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}