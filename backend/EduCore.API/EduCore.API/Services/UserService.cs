using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class UserService : IUserService
{
    private readonly EduCoreDbContext _context;
    private readonly IPasswordService _passwordService;

    public UserService(
        EduCoreDbContext context,
        IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<List<UserResponse>> GetAllAsync()
    {
        return await _context.Users
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.Email,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive
            })
            .ToListAsync();
    }

    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return null;

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.Email,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        };
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true,
            IsEmailVerified = true,
            MustChangePassword = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.Email,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        };
    }

    public async Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return null;

        user.Email = request.Email;
        user.Role = request.Role;

        await _context.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.Email,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        };
    }

    public async Task<bool> ToggleStatusAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        user.IsActive = !user.IsActive;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return false;

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return true;
    }
}