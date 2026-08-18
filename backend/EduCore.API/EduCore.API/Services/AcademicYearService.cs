using EduCore.API.Data;
using EduCore.API.Interfaces;
using EduCore.API.DTOs;
using EduCore.API.Models;
using EduCore.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AcademicYearService : IAcademicYearService
{
    private readonly EduCoreDbContext _context;

    public AcademicYearService(EduCoreDbContext context)
    {
        _context = context;
    }

    private static AcademicYearResponse MapToResponse(AcademicYear year)
    {
        return new AcademicYearResponse
        {
            Id = year.Id,
            SchoolYear = year.SchoolYear,
            StartDate = year.StartDate,
            EndDate = year.EndDate,
            Status = year.Status.ToString(),
            IsActive = year.Status == AcademicYearStatus.Current,
            EnrollmentStartDate = year.EnrollmentStartDate,
            EnrollmentEndDate = year.EnrollmentEndDate,
            IsEnrollmentOpen = year.IsEnrollmentOpen,
            IsReturningEnrollmentOpen = year.IsReturningEnrollmentOpen,
            CurrentSemester = string.IsNullOrWhiteSpace(year.CurrentSemester) ? "1st Semester" : year.CurrentSemester,
            ClassesStartDate = year.ClassesStartDate,
            ClassesEndDate = year.ClassesEndDate,
            GraduationDate = year.GraduationDate,
            CreatedAt = year.CreatedAt,
            UpdatedAt = year.UpdatedAt
        };
    }

    public async Task<List<AcademicYearResponse>> GetAllAsync()
    {
        var years = await _context.AcademicYears
            .OrderByDescending(x => x.StartDate)
            .ToListAsync();

        return years.Select(MapToResponse).ToList();
    }

    public async Task<AcademicYearResponse?> GetByIdAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        return year == null ? null : MapToResponse(year);
    }

    public async Task<AcademicYearResponse?> GetActiveAsync()
    {
        var year = await _context.AcademicYears
            .FirstOrDefaultAsync(x => x.Status == AcademicYearStatus.Current)
            ?? await _context.AcademicYears.OrderByDescending(x => x.StartDate).FirstOrDefaultAsync();

        return year == null ? null : MapToResponse(year);
    }

    public async Task<AcademicYearResponse> CreateAsync(CreateAcademicYearRequest request)
    {
        if (request.IsActive)
        {
            var activeYears = await _context.AcademicYears
                .Where(x => x.Status == AcademicYearStatus.Current)
                .ToListAsync();

            foreach (var item in activeYears)
                item.Status = AcademicYearStatus.Completed;
        }

        var year = new AcademicYear
        {
            SchoolYear = request.SchoolYear,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            Status = request.IsActive ? AcademicYearStatus.Current : AcademicYearStatus.Upcoming,
            EnrollmentStartDate = request.EnrollmentStartDate.HasValue ? DateTime.SpecifyKind(request.EnrollmentStartDate.Value, DateTimeKind.Utc) : null,
            EnrollmentEndDate = request.EnrollmentEndDate.HasValue ? DateTime.SpecifyKind(request.EnrollmentEndDate.Value, DateTimeKind.Utc) : null,
            IsEnrollmentOpen = request.IsEnrollmentOpen,
            IsReturningEnrollmentOpen = request.IsReturningEnrollmentOpen,
            CurrentSemester = string.IsNullOrWhiteSpace(request.CurrentSemester) ? "1st Semester" : request.CurrentSemester,
            ClassesStartDate = request.ClassesStartDate.HasValue ? DateTime.SpecifyKind(request.ClassesStartDate.Value, DateTimeKind.Utc) : null,
            ClassesEndDate = request.ClassesEndDate.HasValue ? DateTime.SpecifyKind(request.ClassesEndDate.Value, DateTimeKind.Utc) : null,
            GraduationDate = request.GraduationDate.HasValue ? DateTime.SpecifyKind(request.GraduationDate.Value, DateTimeKind.Utc) : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.AcademicYears.Add(year);
        await _context.SaveChangesAsync();

        return MapToResponse(year);
    }

    public async Task<AcademicYearResponse?> UpdateAsync(int id, UpdateAcademicYearRequest request)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        if (year == null) return null;

        if (request.IsActive && year.Status != AcademicYearStatus.Current)
        {
            var activeYears = await _context.AcademicYears
                .Where(x => x.Status == AcademicYearStatus.Current)
                .ToListAsync();

            foreach (var item in activeYears)
                item.Status = AcademicYearStatus.Completed;

            year.Status = AcademicYearStatus.Current;
        }

        year.SchoolYear = request.SchoolYear;
        year.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        year.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);
        year.EnrollmentStartDate = request.EnrollmentStartDate.HasValue ? DateTime.SpecifyKind(request.EnrollmentStartDate.Value, DateTimeKind.Utc) : null;
        year.EnrollmentEndDate = request.EnrollmentEndDate.HasValue ? DateTime.SpecifyKind(request.EnrollmentEndDate.Value, DateTimeKind.Utc) : null;
        year.IsEnrollmentOpen = request.IsEnrollmentOpen;
        year.IsReturningEnrollmentOpen = request.IsReturningEnrollmentOpen;
        year.CurrentSemester = string.IsNullOrWhiteSpace(request.CurrentSemester) ? "1st Semester" : request.CurrentSemester;
        year.ClassesStartDate = request.ClassesStartDate.HasValue ? DateTime.SpecifyKind(request.ClassesStartDate.Value, DateTimeKind.Utc) : null;
        year.ClassesEndDate = request.ClassesEndDate.HasValue ? DateTime.SpecifyKind(request.ClassesEndDate.Value, DateTimeKind.Utc) : null;
        year.GraduationDate = request.GraduationDate.HasValue ? DateTime.SpecifyKind(request.GraduationDate.Value, DateTimeKind.Utc) : null;
        year.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(year);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        if (year == null) return false;

        _context.AcademicYears.Remove(year);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetActiveAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        if (year == null) return false;

        var activeYears = await _context.AcademicYears
            .Where(x => x.Status == AcademicYearStatus.Current)
            .ToListAsync();

        foreach (var item in activeYears)
            item.Status = AcademicYearStatus.Completed;

        year.Status = AcademicYearStatus.Current;
        year.UpdatedAt = DateTime.UtcNow;

        // Also update SchoolSetting.CurrentAcademicYearId
        var setting = await _context.SchoolSettings.FirstOrDefaultAsync();
        if (setting != null)
        {
            setting.CurrentAcademicYearId = year.Id;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetSemesterAsync(int id, string semester)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        if (year == null) return false;

        year.CurrentSemester = semester;
        year.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveAsync(int id)
    {
        var year = await _context.AcademicYears.FindAsync(id);
        if (year == null) return false;

        year.Status = AcademicYearStatus.Archived;
        year.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}