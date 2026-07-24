using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class TeachingAssignmentService : ITeachingAssignmentService
{
    private readonly EduCoreDbContext _context;

    public TeachingAssignmentService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<TeachingAssignmentResponse>> GetAllAsync()
    {
        return await _context.TeachingAssignments
            .Include(t => t.Employee)
            .Include(t => t.Subject)
            .Include(t => t.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.GradeLevel)
            .Select(t => new TeachingAssignmentResponse
            {
                Id = t.Id,
                EmployeeId = t.EmployeeId,
                EmployeeName = t.Employee.FirstName + " " + t.Employee.LastName,
                SubjectId = t.SubjectId,
                SubjectName = t.Subject.SubjectName,
                SectionId = t.SectionId,
                SectionName = t.Section.ProgramOffering.GradeLevel.Name + " - " + t.Section.SectionName,
                IsActive = t.IsActive
            })
            .ToListAsync();
    }

    public async Task<TeachingAssignmentResponse?> GetByIdAsync(int id)
    {
        return (await GetAllAsync()).FirstOrDefault(x => x.Id == id);
    }

    public async Task<TeachingAssignmentResponse> CreateAsync(CreateTeachingAssignmentRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId && x.IsActive);
            
        if (employee == null)
            throw new Exception("Employee not found.");

        var subject = await _context.Subjects
            .FirstOrDefaultAsync(x => x.Id == request.SubjectId && x.IsActive);
            
        if (subject == null)
            throw new Exception("Subject not found.");

        var section = await _context.Sections
            .Include(s => s.ProgramOffering)
            .ThenInclude(p => p.GradeLevel)
            .FirstOrDefaultAsync(x => x.Id == request.SectionId && x.IsActive);
            
        if (section == null)
            throw new Exception("Section not found.");

        var exists = await _context.TeachingAssignments.AnyAsync(x =>
            x.EmployeeId == request.EmployeeId &&
            x.SubjectId == request.SubjectId &&
            x.SectionId == request.SectionId);

        if (exists)
            throw new Exception("Teaching assignment already exists.");

        var assignment = new TeachingAssignment
        {
            EmployeeId = request.EmployeeId,
            SubjectId = request.SubjectId,
            SectionId = request.SectionId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.TeachingAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(assignment.Id))!;
    }

    public async Task<TeachingAssignmentResponse?> UpdateAsync(int id, UpdateTeachingAssignmentRequest request)
    {
        var assignment = await _context.TeachingAssignments.FirstOrDefaultAsync(x => x.Id == id);

        if (assignment == null)
            return null;

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId && x.IsActive);
            
        if (employee == null)
            throw new Exception("Employee not found.");

        var subject = await _context.Subjects
            .FirstOrDefaultAsync(x => x.Id == request.SubjectId && x.IsActive);
            
        if (subject == null)
            throw new Exception("Subject not found.");

        var section = await _context.Sections
            .Include(s => s.ProgramOffering)
            .ThenInclude(p => p.GradeLevel)
            .FirstOrDefaultAsync(x => x.Id == request.SectionId && x.IsActive);
            
        if (section == null)
            throw new Exception("Section not found.");

        var exists = await _context.TeachingAssignments.AnyAsync(x =>
            x.Id != id &&
            x.EmployeeId == request.EmployeeId &&
            x.SubjectId == request.SubjectId &&
            x.SectionId == request.SectionId);

        if (exists)
            throw new Exception("Teaching assignment already exists.");

        assignment.EmployeeId = request.EmployeeId;
        assignment.SubjectId = request.SubjectId;
        assignment.SectionId = request.SectionId;
        assignment.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var assignment = await _context.TeachingAssignments.FirstOrDefaultAsync(x => x.Id == id);

        if (assignment == null)
            return false;

        _context.TeachingAssignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return true;
    }
}