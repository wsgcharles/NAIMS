using EduCore.API.Data;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Seeders;

public static class DatabaseSeeder
{
    public static async Task SeedSuperAdminAsync(
        EduCoreDbContext context,
        IPasswordService passwordService)
    {
        // Check if a Super Administrator already exists
        if (await context.Users.AnyAsync(u => u.Role == UserRole.SuperAdministrator))
            return;

        var admin = new User
        {
            Email = "admin@educore.local",
            PasswordHash = passwordService.HashPassword("Admin@123"),

            Role = UserRole.SuperAdministrator,

            IsActive = true,
            IsEmailVerified = true,
            MustChangePassword = false,

            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);

        await context.SaveChangesAsync();

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("=========================================");
        Console.WriteLine(" Super Administrator created successfully");
        Console.WriteLine("=========================================");
        Console.WriteLine(" Email    : admin@educore.local");
        Console.WriteLine(" Password : Admin@123");
        Console.WriteLine("=========================================");
        Console.ResetColor();
    }
}