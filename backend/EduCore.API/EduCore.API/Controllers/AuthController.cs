using System.Security.Claims;
using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public AuthController(
        EduCoreDbContext context,
        IPasswordService passwordService,
        IPasswordPolicyService passwordPolicyService,
        IJwtService jwtService,
        IEmailService emailService)
    {
        _context = context;
        _passwordService = passwordService;
        _passwordPolicyService = passwordPolicyService;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (user == null)
            return Unauthorized("Invalid email or password.");

        // Account Lockout Check
        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
        {
            var remainingMinutes = Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            return StatusCode(StatusCodes.Status423Locked, new LoginResponse
            {
                Email = user.Email,
                Role = user.Role.ToString(),
                NextAction = "ACCOUNT_LOCKED",
                Message = $"Account locked due to multiple failed login attempts. Please try again in {remainingMinutes} minutes."
            });
        }

        // Verify Password
        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            user.FailedLoginCount++;
            user.LastFailedLogin = DateTime.UtcNow;

            if (user.FailedLoginCount >= 5)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
            }

            await _context.SaveChangesAsync();
            return Unauthorized("Invalid email or password.");
        }

        if (!user.IsActive)
            return Unauthorized("This account has been disabled. Please contact the administrator.");

        // Successful Login - Reset Lockout & Track Login
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        // Resolve Full Name
        var fullName = user.Email;
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (employee != null)
        {
            fullName = $"{employee.FirstName} {employee.LastName}";
        }
        else
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
            if (student != null)
                fullName = $"{student.FirstName} {student.LastName}";
            else
            {
                var parent = await _context.Parents.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (parent != null)
                    fullName = $"{parent.FirstName} {parent.LastName}";
            }
        }

        var nextAction = user.MustChangePassword ? "CHANGE_PASSWORD" : "DASHBOARD";
        var message = user.MustChangePassword
            ? "Password change required upon first login."
            : "Login successful.";

        return Ok(new LoginResponse
        {
            Token = token,
            FullName = fullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            MustChangePassword = user.MustChangePassword,
            IsFirstLogin = user.IsFirstLogin,
            NextAction = nextAction,
            Message = message
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (email == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null) return Unauthorized();

        var fullName = user.Email;
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (employee != null)
        {
            fullName = $"{employee.FirstName} {employee.LastName}";
        }
        else
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
            if (student != null)
                fullName = $"{student.FirstName} {student.LastName}";
            else
            {
                var parent = await _context.Parents.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (parent != null)
                    fullName = $"{parent.FirstName} {parent.LastName}";
            }
        }

        return Ok(new CurrentUserResponse
        {
            Id = user.Id,
            FullName = fullName,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return Unauthorized();

        if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect.");

        if (request.CurrentPassword == request.NewPassword)
            return BadRequest("New password must be different from current password.");

        var (isValid, errorMessage) = _passwordPolicyService.ValidatePasswordStrength(request.NewPassword);
        if (!isValid)
            return BadRequest(errorMessage);

        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.MustChangePassword = false;
        user.IsFirstLogin = false;
        user.PasswordChangedAt = DateTime.UtcNow;
        if (!user.AccountActivatedAt.HasValue)
            user.AccountActivatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);

        if (user != null)
        {
            var rawToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            user.PasswordResetTokenHash = _passwordPolicyService.HashResetToken(rawToken);
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

            await _context.SaveChangesAsync();

            var resetLink = $"https://portal.noahsacademy.edu.ph/reset-password?token={rawToken}";

            var fullName = user.Email;
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (employee != null) fullName = $"{employee.FirstName} {employee.LastName}";

            await _emailService.QueueEmailAsync(
                user.Email,
                "EduCore Password Reset Request",
                "PasswordReset",
                new PasswordResetEmailViewModel
                {
                    RecipientName = fullName,
                    ResetLink = resetLink,
                    ExpirationMinutes = 30
                });
        }

        // Always return generic response to prevent account enumeration
        return Ok(new
        {
            message = "If an account with that email address exists, a password reset link has been sent."
        });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var hashedToken = _passwordPolicyService.HashResetToken(request.Token);
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetTokenHash == hashedToken &&
            u.PasswordResetTokenExpiry.HasValue &&
            u.PasswordResetTokenExpiry.Value > DateTime.UtcNow &&
            u.IsActive);

        if (user == null)
            return BadRequest("Invalid or expired password reset token.");

        var (isValid, errorMessage) = _passwordPolicyService.ValidatePasswordStrength(request.NewPassword);
        if (!isValid)
            return BadRequest(errorMessage);

        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiry = null;
        user.MustChangePassword = false;
        user.IsFirstLogin = false;
        user.PasswordChangedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You may now log in with your new password." });
    }
}