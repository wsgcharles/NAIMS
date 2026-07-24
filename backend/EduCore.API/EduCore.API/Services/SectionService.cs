using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class SectionService : ISectionService
{
    private readonly EduCoreDbContext _context;

    public SectionService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<SectionResponse>> GetAllAsync()
    {
        return await _context.Sections
            .OrderBy(x => x.ProgramOffering.GradeLevel.Name)
            .ThenBy(x => x.SectionName)
            .Select(x => new SectionResponse
            {
                Id = x.Id,
                ProgramOfferingId = x.ProgramOfferingId,
                ProgramOfferingName = x.ProgramOffering.GradeLevel.Name,
                SectionName = x.SectionName,
                Capacity = x.Capacity,
                CurrentStudents = 0,
                AdviserEmployeeId = x.AdviserEmployeeId,
                AdviserName = x.Adviser != null ? $"{x.Adviser.FirstName} {x.Adviser.LastName}" : "",
                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    public async Task<SectionResponse?> GetByIdAsync(int id)
    {
        var section = await _context.Sections
            .Include(x => x.ProgramOffering)
                .ThenInclude(p => p.GradeLevel)
            .Include(x => x.Adviser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (section == null)
            return null;

        return new SectionResponse
        {
            Id = section.Id,
            ProgramOfferingId = section.ProgramOfferingId,
            ProgramOfferingName = section.ProgramOffering?.GradeLevel?.Name ?? "",
            SectionName = section.SectionName,
            Capacity = section.Capacity,
            CurrentStudents = 0,
            AdviserEmployeeId = section.AdviserEmployeeId,
            AdviserName = section.Adviser != null ? $"{section.Adviser.FirstName} {section.Adviser.LastName}" : "",
            IsActive = section.IsActive
        };
    }

    public async Task<SectionResponse> CreateAsync(CreateSectionRequest request)
    {
        var exists = await _context.Sections.AnyAsync(x =>
            x.ProgramOfferingId == request.ProgramOfferingId &&
            x.SectionName == request.SectionName);

        if (exists)
            throw new Exception("Section already exists.");

        var section = new Section
        {
            ProgramOfferingId = request.ProgramOfferingId,
            SectionName = request.SectionName,
            Capacity = request.Capacity,
            AdviserEmployeeId = request.AdviserEmployeeId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Sections.Add(section);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(section.Id))!;
    }

    public async Task<SectionResponse?> UpdateAsync(
        int id,
        UpdateSectionRequest request)
    {
        var section = await _context.Sections.FindAsync(id);

        if (section == null)
            return null;

        section.ProgramOfferingId = request.ProgramOfferingId;
        section.SectionName = request.SectionName;
        section.Capacity = request.Capacity;
        section.AdviserEmployeeId = request.AdviserEmployeeId;
        section.IsActive = request.IsActive;
        section.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var section = await _context.Sections.FindAsync(id);

        if (section == null)
            return false;

        _context.Sections.Remove(section);

        await _context.SaveChangesAsync();

        return true;
    }
}