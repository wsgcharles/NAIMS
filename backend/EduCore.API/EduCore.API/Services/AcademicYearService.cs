using EduCore.API.Data;
using EduCore.API.Interfaces;
using EduCore.API.DTOs;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AcademicYearService : IAcademicYearService
{
    private readonly EduCoreDbContext _context;

    public AcademicYearService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<AcademicYearResponse>> GetAllAsync()
    {
        return await _context.AcademicYears
            .OrderByDescending(x => x.StartDate)
            .Select(x => new AcademicYearResponse
            {
                Id = x.Id,
                SchoolYear = x.SchoolYear,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.Status == EduCore.API.Enums.AcademicYearStatus.Current
            })
            .ToListAsync();
    }

    public async Task<AcademicYearResponse?> GetByIdAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);

        if (year == null)
            return null;

        return new AcademicYearResponse
        {
            Id = year.Id,
            SchoolYear = year.SchoolYear,
            StartDate = year.StartDate,
            EndDate = year.EndDate,
            IsActive = year.Status == EduCore.API.Enums.AcademicYearStatus.Current
        };
    }

    public async Task<AcademicYearResponse> CreateAsync(CreateAcademicYearRequest request)
    {
        if (request.IsActive)
        {
            var activeYears = await _context.AcademicYears
                .Where(x => x.Status == EduCore.API.Enums.AcademicYearStatus.Current)
                .ToListAsync();

            foreach (var item in activeYears)
                item.Status = EduCore.API.Enums.AcademicYearStatus.Completed;
        }

        var year = new AcademicYear
        {
            SchoolYear = request.SchoolYear,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            Status = request.IsActive ? EduCore.API.Enums.AcademicYearStatus.Current : EduCore.API.Enums.AcademicYearStatus.Upcoming,
            CreatedAt = DateTime.UtcNow
        };

        _context.AcademicYears.Add(year);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(year.Id))!;
    }

    public async Task<AcademicYearResponse?> UpdateAsync(
        int id,
        UpdateAcademicYearRequest request)
    {
        var year = await _context.AcademicYears.FindAsync(id);

        if (year == null)
            return null;

        if (request.IsActive)
        {
            var activeYears = await _context.AcademicYears
                .Where(x => x.Status == EduCore.API.Enums.AcademicYearStatus.Current)
                .ToListAsync();

            foreach (var item in activeYears)
                item.Status = EduCore.API.Enums.AcademicYearStatus.Completed;
        }

        year.SchoolYear = request.SchoolYear;
        year.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        year.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);
        year.Status = request.IsActive ? EduCore.API.Enums.AcademicYearStatus.Current : EduCore.API.Enums.AcademicYearStatus.Upcoming;
        year.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);

        if (year == null)
            return false;

        _context.AcademicYears.Remove(year);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> SetActiveAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);

        if (year == null)
            return false;

        var activeYears = await _context.AcademicYears
            .Where(x => x.Status == EduCore.API.Enums.AcademicYearStatus.Current)
            .ToListAsync();

        foreach (var item in activeYears)
            item.Status = EduCore.API.Enums.AcademicYearStatus.Completed;

        year.Status = EduCore.API.Enums.AcademicYearStatus.Current;
        year.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
}