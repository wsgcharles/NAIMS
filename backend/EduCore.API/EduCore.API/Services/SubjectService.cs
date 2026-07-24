using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class SubjectService : ISubjectService
{
    private readonly EduCoreDbContext _context;

    public SubjectService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<SubjectResponse>> GetAllAsync()
    {
        return await _context.Subjects
            .Include(s => s.GradeLevel)
            .OrderBy(x => x.GradeLevel.Name)
            .ThenBy(x => x.SubjectName)
            .Select(s => new SubjectResponse
            {
                Id = s.Id,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                GradeLevelId = s.GradeLevelId,
                GradeLevel = s.GradeLevel.Name,
                IsCoreSubject = s.IsCoreSubject,
                Units = s.Units,
                IsActive = s.IsActive
            })
            .ToListAsync();
    }

    public async Task<SubjectResponse?> GetByIdAsync(int id)
    {
        return (await GetAllAsync()).FirstOrDefault(x => x.Id == id);
    }

    public async Task<SubjectResponse> CreateAsync(CreateSubjectRequest request)
    {
        var exists = await _context.Subjects.AnyAsync(x =>
            x.SubjectCode == request.SubjectCode);

        if (exists)
            throw new Exception("Subject code already exists.");

        var gradeLevel = await _context.GradeLevels.FindAsync(request.GradeLevelId);
        if (gradeLevel == null)
            throw new Exception("Grade level not found.");

        var subject = new Subject
        {
            SubjectCode = request.SubjectCode,
            SubjectName = request.SubjectName,
            GradeLevelId = request.GradeLevelId,
            IsCoreSubject = request.IsCoreSubject,
            Units = request.Units,
            IsActive = true
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(subject.Id))!;
    }

    public async Task<SubjectResponse?> UpdateAsync(
        int id,
        UpdateSubjectRequest request)
    {
        var subject = await _context.Subjects.FindAsync(id);

        if (subject == null)
            return null;

        var gradeLevel = await _context.GradeLevels.FindAsync(request.GradeLevelId);
        if (gradeLevel == null)
            throw new Exception("Grade level not found.");

        subject.SubjectCode = request.SubjectCode;
        subject.SubjectName = request.SubjectName;
        subject.GradeLevelId = request.GradeLevelId;
        subject.IsCoreSubject = request.IsCoreSubject;
        subject.Units = request.Units;
        subject.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);

        if (subject == null)
            return false;

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();

        return true;
    }
}