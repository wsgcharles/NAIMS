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
            .Include(s => s.Program)
            .OrderBy(x => x.GradeLevel.Name)
            .ThenBy(x => x.SubjectName)
            .Select(s => new SubjectResponse
            {
                Id = s.Id,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                GradeLevelId = s.GradeLevelId,
                GradeLevel = s.GradeLevel.Name,
                ProgramId = s.ProgramId,
                ProgramCode = s.Program != null ? s.Program.Code : null,
                ProgramName = s.Program != null ? s.Program.Name : null,
                IsCoreSubject = s.IsCoreSubject,
                CurriculumVersion = s.CurriculumVersion,
                SubjectType = s.SubjectType,
                Semester = s.Semester,
                DomainCategory = s.DomainCategory,
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

        // Validation Rule: For Grades 1-10, ProgramId must be null
        int? programId = request.ProgramId;
        if (gradeLevel.EducationLevel != Enums.EducationLevel.SeniorHighSchool)
        {
            programId = null;
        }

        if (programId.HasValue)
        {
            var program = await _context.Programs.FindAsync(programId.Value);
            if (program == null) throw new Exception("Selected strand / academic program not found.");
        }

        var subject = new Subject
        {
            SubjectCode = request.SubjectCode,
            SubjectName = request.SubjectName,
            GradeLevelId = request.GradeLevelId,
            ProgramId = programId,
            IsCoreSubject = request.IsCoreSubject,
            CurriculumVersion = string.IsNullOrWhiteSpace(request.CurriculumVersion) ? "MATATAG-K10" : request.CurriculumVersion,
            SubjectType = string.IsNullOrWhiteSpace(request.SubjectType) ? "Core" : request.SubjectType,
            Semester = request.Semester,
            DomainCategory = request.DomainCategory,
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

        // Validation Rule: For Grades 1-10, ProgramId must be null
        int? programId = request.ProgramId;
        if (gradeLevel.EducationLevel != Enums.EducationLevel.SeniorHighSchool)
        {
            programId = null;
        }

        if (programId.HasValue)
        {
            var program = await _context.Programs.FindAsync(programId.Value);
            if (program == null) throw new Exception("Selected strand / academic program not found.");
        }

        subject.SubjectCode = request.SubjectCode;
        subject.SubjectName = request.SubjectName;
        subject.GradeLevelId = request.GradeLevelId;
        subject.ProgramId = programId;
        subject.IsCoreSubject = request.IsCoreSubject;
        if (!string.IsNullOrWhiteSpace(request.CurriculumVersion)) subject.CurriculumVersion = request.CurriculumVersion;
        if (!string.IsNullOrWhiteSpace(request.SubjectType)) subject.SubjectType = request.SubjectType;
        subject.Semester = request.Semester;
        subject.DomainCategory = request.DomainCategory;
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