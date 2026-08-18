using System.Diagnostics;
using System.Security.Claims;
using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly EduCoreDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IPasswordPolicyService _passwordPolicyService;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;
    private readonly IAuditLogService _auditLogService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        EduCoreDbContext context,
        IPasswordService passwordService,
        IPasswordPolicyService passwordPolicyService,
        IJwtService jwtService,
        IEmailService emailService,
        IAuditLogService auditLogService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordService = passwordService;
        _passwordPolicyService = passwordPolicyService;
        _jwtService = jwtService;
        _emailService = emailService;
        _auditLogService = auditLogService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        // Account lockout check — run before password verification to prevent timing oracle
        if (user != null && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            await _auditLogService.LogAsync("Login Blocked", "User", user.Id.ToString(), $"Account locked. Attempt from: {request.Email}");
            return Unauthorized($"Account is temporarily locked due to too many failed login attempts. Please try again in {remaining} minute(s).");
        }

        if (user == null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            if (user != null)
            {
                // Increment failed login counter
                user.FailedLoginCount = (user.FailedLoginCount) + 1;
                user.LastFailedLogin = DateTime.UtcNow;

                // Lock account after 5 consecutive failures for 5 minutes
                if (user.FailedLoginCount >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(5);
                    await _auditLogService.LogAsync("Account Locked", "User", user.Id.ToString(), $"Account locked after {user.FailedLoginCount} failed attempts: {user.Email}");
                }
                await _context.SaveChangesAsync();
            }

            await _auditLogService.LogAsync("Login Failed", "User", null, $"Attempted email: {request.Email}");
            return Unauthorized("Invalid credentials.");
        }

        if (!user.IsActive)
            return Unauthorized("Account is inactive.");

        // Reset failed login counter on successful login
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        user.LastFailedLogin = null;

        var token = _jwtService.GenerateToken(user);

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Login Success", "User", user.Id.ToString(), $"User logged in: {user.Email}");

        var (fullName, firstName, lastName) = await GetUserProfileNamesAsync(user);

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            FullName = fullName,
            FirstName = firstName,
            LastName = lastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            MustChangePassword = user.MustChangePassword,
            IsFirstLogin = user.IsFirstLogin,
            NextAction = user.MustChangePassword ? "CHANGE_PASSWORD" : "DASHBOARD"
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var (fullName, firstName, lastName) = await GetUserProfileNamesAsync(user);

        return Ok(new CurrentUserResponse
        {
            Id = user.Id,
            FullName = fullName,
            FirstName = firstName,
            LastName = lastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            MustChangePassword = user.MustChangePassword,
            IsFirstLogin = user.IsFirstLogin
        });
    }

    private async Task<(string FullName, string FirstName, string LastName)> GetUserProfileNamesAsync(User user)
    {
        string firstName = "";
        string lastName = "";
        string fullName = user.Email;

        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (employee != null)
        {
            firstName = employee.FirstName;
            lastName = employee.LastName;
            fullName = $"{employee.FirstName} {employee.LastName}";
        }
        else
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
            if (student != null)
            {
                firstName = student.FirstName;
                lastName = student.LastName;
                fullName = $"{student.FirstName} {student.LastName}";
            }
            else
            {
                var parent = await _context.Parents.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (parent != null)
                {
                    firstName = parent.FirstName;
                    lastName = parent.LastName;
                    fullName = $"{parent.FirstName} {parent.LastName}";
                }
            }
        }

        if (string.IsNullOrWhiteSpace(firstName))
        {
            var emailPrefix = user.Email.Split('@')[0];
            var parts = emailPrefix.Split(new char[] { '.', '_', '-' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
            {
                firstName = char.ToUpper(parts[0][0]) + parts[0][1..];
                lastName = char.ToUpper(parts[1][0]) + parts[1][1..];
                fullName = $"{firstName} {lastName}";
            }
            else
            {
                firstName = char.ToUpper(emailPrefix[0]) + emailPrefix[1..];
                lastName = "";
                fullName = firstName;
            }
        }

        return (fullName, firstName, lastName);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdClaim = User.FindFirst("UserId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect.");

        var (isValid, errorMessage) = _passwordPolicyService.ValidatePasswordStrength(request.NewPassword);
        if (!isValid)
            return BadRequest(errorMessage);

        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.MustChangePassword = false;
        user.IsFirstLogin = false;
        user.PasswordChangedAt = DateTime.UtcNow;
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        user.LastFailedLogin = null;

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("Password Changed", "User", user.Id.ToString(), "User changed password.");

        return Ok(new { message = "Password changed successfully." });
    }

    /// <summary>
    /// Rate limited: 3 requests per IP per 15 minutes.
    /// Generates a 6-digit numeric verification code, hashes it before saving to DB, and queues an email.
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var sw = Stopwatch.StartNew();

        try
        {
            var email = request.Email.Trim().ToLowerInvariant();
            _logger.LogInformation("[AuthController] Forgot password request received → Email={Email}", email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);

            if (user != null)
            {
                await _auditLogService.LogAsync("Password Reset Requested", "User", user.Id.ToString(), $"Email: {user.Email}");

                // Invalidate all previous codes for this user
                var previousCodes = await _context.PasswordResetCodes
                    .Where(c => c.UserId == user.Id && !c.Used)
                    .ToListAsync();
                foreach (var prev in previousCodes)
                {
                    prev.Used = true;
                }

                // Cryptographically secure 6-digit random code
                var rawCode = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
                var codeHash = _passwordPolicyService.HashResetToken(rawCode);

                var resetCodeEntity = new PasswordResetCode
                {
                    UserId = user.Id,
                    CodeHash = codeHash,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    Used = false,
                };

                _context.PasswordResetCodes.Add(resetCodeEntity);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "[AuthController] ✅ Database save succeeded → PasswordResetCode#{Id} created for UserId={UserId}",
                    resetCodeEntity.Id, user.Id);

                await _auditLogService.LogAsync("Verification Code Generated", "User", user.Id.ToString(), $"6-digit code generated for {user.Email}");

                var fullName = user.Email;
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
                if (employee != null) fullName = $"{employee.FirstName} {employee.LastName}";

                await _emailService.QueueEmailAsync(
                    user.Email,
                    "Password Reset Verification Code",
                    "PasswordReset",
                    new PasswordResetEmailViewModel
                    {
                        RecipientName = fullName,
                        VerificationCode = rawCode,
                        ExpirationMinutes = 15
                    });

                _logger.LogInformation(
                    "[AuthController] ✅ Verification code email queued successfully → To={To}",
                    user.Email);
            }
            else
            {
                _logger.LogInformation(
                    "[AuthController] Forgot password requested for unknown/inactive email → masked");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AuthController] ❌ Exception in ForgotPassword endpoint → Error={Message}", ex.Message);
            return StatusCode(500, new { message = "An internal server error occurred while processing your request." });
        }

        sw.Stop();
        var minResponse = TimeSpan.FromMilliseconds(250);
        if (sw.Elapsed < minResponse)
            await Task.Delay(minResponse - sw.Elapsed);

        return Ok(new
        {
            message = "If an account with that email address exists, a verification code has been sent."
        });
    }

    [HttpPost("verify-reset-code")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyResetCode(VerifyResetCodeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);

        if (user == null)
        {
            await _auditLogService.LogAsync("Verification Failed", "User", null, $"Invalid email attempted: {email}");
            return BadRequest("Invalid or expired verification code.");
        }

        var codeHash = _passwordPolicyService.HashResetToken(request.Code.Trim());
        var resetRecord = await _context.PasswordResetCodes
            .FirstOrDefaultAsync(c =>
                c.UserId == user.Id &&
                c.CodeHash == codeHash &&
                !c.Used &&
                c.ExpiresAt > DateTime.UtcNow);

        if (resetRecord == null)
        {
            await _auditLogService.LogAsync("Verification Failed", "User", user.Id.ToString(), $"Invalid or expired code for {user.Email}");
            return BadRequest("Invalid or expired verification code.");
        }

        await _auditLogService.LogAsync("Verification Successful", "User", user.Id.ToString(), $"Valid code verified for {user.Email}");
        return Ok(new { message = "Verification code is valid." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);

        if (user == null)
        {
            await _auditLogService.LogAsync("Password Reset Failed", "User", null, $"Invalid user email: {email}");
            return BadRequest("Invalid or expired verification code.");
        }

        var codeHash = _passwordPolicyService.HashResetToken(request.Code.Trim());
        var resetRecord = await _context.PasswordResetCodes
            .FirstOrDefaultAsync(c =>
                c.UserId == user.Id &&
                c.CodeHash == codeHash &&
                !c.Used &&
                c.ExpiresAt > DateTime.UtcNow);

        if (resetRecord == null)
        {
            await _auditLogService.LogAsync("Password Reset Failed", "User", user.Id.ToString(), $"Code expired or invalid for {user.Email}");
            return BadRequest("Invalid or expired verification code.");
        }

        var (isValid, errorMessage) = _passwordPolicyService.ValidatePasswordStrength(request.NewPassword);
        if (!isValid)
            return BadRequest(errorMessage);

        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.MustChangePassword = false;
        user.IsFirstLogin = false;
        user.PasswordChangedAt = DateTime.UtcNow;
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        user.LastFailedLogin = null;

        resetRecord.Used = true;
        resetRecord.UsedAt = DateTime.UtcNow;

        var allUserCodes = await _context.PasswordResetCodes
            .Where(c => c.UserId == user.Id && !c.Used)
            .ToListAsync();
        foreach (var c in allUserCodes)
        {
            c.Used = true;
            c.UsedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync("Password Successfully Changed", "User", user.Id.ToString(), $"Password reset completed for {user.Email}");

        _logger.LogInformation(
            "[AuthController] Password reset completed via verification code → UserId={UserId}",
            user.Id);

        return Ok(new { message = "Password reset successfully. You may now log in with your new password." });
    }

    /// <summary>
    /// DIAGNOSTIC ENDPOINT — for development and IT admin use only.
    /// Restricted to SuperAdministrator role to prevent email abuse.
    ///
    /// Usage: GET /api/auth/test-email?to=youraddress@example.com
    /// </summary>
    [HttpGet("test-email")]
    [Authorize(Roles = "SuperAdministrator")]
    public async Task<IActionResult> TestEmail([FromQuery] string? to)
    {
        var recipient = to ?? _configuration["SmtpSettings:Username"] ?? "charlesuday12@gmail.com";

        _logger.LogInformation(
            "[TestEmail] Direct SMTP test requested → Recipient={Recipient}",
            recipient);

        var htmlBody = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #6b21a8;">Noah's Academy SMTP Diagnostic Test</h2>
                <p>If you are reading this, SMTP is configured correctly.</p>
                <hr />
                <p><strong>Sent at:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                <p><strong>Recipient:</strong> {recipient}</p>
                <p style="color: #ef4444; font-size: 0.85em;">
                    This is a diagnostic email sent by an authorized administrator.
                </p>
            </body>
            </html>
            """;

        await _emailService.SendRawEmailAsync(
            recipient,
            "Noah's Academy — Direct SMTP Test Email",
            htmlBody);

        return Ok(new
        {
            message = $"Test email sent successfully to {recipient}.",
            recipient,
            timestampUtc = DateTime.UtcNow
        });
    }
}