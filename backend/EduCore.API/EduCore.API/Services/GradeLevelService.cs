using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class GradeLevelService : IGradeLevelService
{
    private readonly EduCoreDbContext _context;

    public GradeLevelService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<GradeLevelResponse>> GetAllAsync()
    {
        return await _context.GradeLevels
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new GradeLevelResponse
            {
                Id = x.Id,
                Name = x.Name,
                DisplayOrder = x.DisplayOrder,
                EducationLevel = x.EducationLevel.ToString(),
                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    public async Task<GradeLevelResponse?> GetByIdAsync(int id)
    {
        var gradeLevel = await _context.GradeLevels.FindAsync(id);
        if (gradeLevel == null) return null;

        return new GradeLevelResponse
        {
            Id = gradeLevel.Id,
            Name = gradeLevel.Name,
            DisplayOrder = gradeLevel.DisplayOrder,
            EducationLevel = gradeLevel.EducationLevel.ToString(),
            IsActive = gradeLevel.IsActive
        };
    }

    public async Task<GradeLevelResponse> CreateAsync(CreateGradeLevelRequest request)
    {
        var gradeLevel = new GradeLevel
        {
            Name = request.Name,
            DisplayOrder = request.DisplayOrder,
            EducationLevel = request.EducationLevel,
            IsActive = request.IsActive
        };

        _context.GradeLevels.Add(gradeLevel);
        await _context.SaveChangesAsync();

        return new GradeLevelResponse
        {
            Id = gradeLevel.Id,
            Name = gradeLevel.Name,
            DisplayOrder = gradeLevel.DisplayOrder,
            EducationLevel = gradeLevel.EducationLevel.ToString(),
            IsActive = gradeLevel.IsActive
        };
    }

    public async Task<GradeLevelResponse?> UpdateAsync(int id, UpdateGradeLevelRequest request)
    {
        var gradeLevel = await _context.GradeLevels.FindAsync(id);
        if (gradeLevel == null) return null;

        gradeLevel.Name = request.Name;
        gradeLevel.DisplayOrder = request.DisplayOrder;
        gradeLevel.EducationLevel = request.EducationLevel;
        gradeLevel.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return new GradeLevelResponse
        {
            Id = gradeLevel.Id,
            Name = gradeLevel.Name,
            DisplayOrder = gradeLevel.DisplayOrder,
            EducationLevel = gradeLevel.EducationLevel.ToString(),
            IsActive = gradeLevel.IsActive
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var gradeLevel = await _context.GradeLevels.FindAsync(id);
        if (gradeLevel == null) return false;

        _context.GradeLevels.Remove(gradeLevel);
        await _context.SaveChangesAsync();
        return true;
    }
}
