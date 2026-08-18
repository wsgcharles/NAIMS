using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using EduCore.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class RegistrarService : IRegistrarService
{
    private readonly EduCoreDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public RegistrarService(EduCoreDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<List<StudentListResponse>> GetStudentsAsync()
    {
        var students = await _context.Students
            .GroupJoin(
                _context.StudentSectionAssignments
                    .Include(ssa => ssa.Section)
                    .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(po => po.GradeLevel)
                    .Include(ssa => ssa.Section)
                    .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(po => po.AcademicYear)
                    .Where(x => x.IsActive),
                student => student.Id,
                assignment => assignment.StudentId,
                (student, assignments) => new
                {
                    Student = student,
                    Assignment = assignments.FirstOrDefault()
                })
            .Select(x => new StudentListResponse
            {
                StudentId = x.Student.Id,
                StudentNumber = x.Student.StudentNumber,

                FullName =
                    x.Student.FirstName + " " +
                    x.Student.LastName,

                GradeLevel = x.Assignment != null
                    ? x.Assignment.Section.ProgramOffering.GradeLevel.Name
                    : "",

                Section = x.Assignment != null
                    ? x.Assignment.Section.SectionName
                    : "",

                AcademicYear = x.Assignment != null
                    ? x.Assignment.Section.ProgramOffering.AcademicYear.SchoolYear
                    : "",

                IsActive = x.Student.Status == StudentStatus.Active
            })
            .OrderBy(x => x.FullName)
            .ToListAsync();

        return students;
    }

    public async Task<StudentRecordResponse?> GetStudentByIdAsync(int studentId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == studentId);

        if (student == null)
            return null;

        var assignment = await _context.StudentSectionAssignments
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(po => po.AcademicYear)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(po => po.GradeLevel)
            .FirstOrDefaultAsync(x =>
                x.StudentId == student.Id &&
                x.IsActive);

        var parent = student.ParentId.HasValue 
            ? await _context.Set<Parent>().FindAsync(student.ParentId.Value) 
            : null;

        var response = new StudentRecordResponse
        {
            StudentId = student.Id,

            PersonalInformation = new PersonalInfoResponse
            {
                StudentNumber = student.StudentNumber,
                LRN = student.LRN,
                FirstName = student.FirstName,
                MiddleName = student.MiddleName,
                LastName = student.LastName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                Address = student.Address,
                Barangay = student.Barangay,
                City = student.City,
                Province = student.Province,
                IsActive = student.Status == StudentStatus.Active
            },

            Parent = parent != null ? new ParentInfoResponse
            {
                Id = parent.Id,
                FullName = $"{parent.FirstName} {parent.LastName}",
                Email = parent.Email,
                PhoneNumber = parent.PhoneNumber,
                Occupation = parent.Occupation,
                RelationshipToStudent = parent.RelationshipToStudent
            } : null,

            CurrentEnrollment = new CurrentEnrollmentResponse
            {
                GradeLevel = assignment?.Section?.ProgramOffering?.GradeLevel?.Name ?? "",
                Section = assignment?.Section?.SectionName ?? "",
                AcademicYear = assignment?.Section?.ProgramOffering?.AcademicYear?.SchoolYear ?? ""
            }
        };

        if (assignment != null)
        {
            response.Subjects = await _context.TeachingAssignments
                .Include(x => x.Employee)
                .Include(x => x.Subject)
                .Where(x =>
                    x.SectionId == assignment.SectionId &&
                    x.IsActive)
                .Select(x => new CurrentSubjectResponse
                {
                    SubjectName = x.Subject.SubjectName,

                    Teacher =
                        x.Employee.FirstName + " " +
                        x.Employee.LastName
                })
                .OrderBy(x => x.SubjectName)
                .ToListAsync();
        }

        var enrollment = await _context.Set<Enrollment>()
            .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.SectionId == (assignment != null ? assignment.SectionId : 0));

        if (enrollment != null)
        {
            response.Grades = await _context.Grades
                .Include(g => g.TeachingAssignment)
                    .ThenInclude(ta => ta.Subject)
                .Where(x => x.EnrollmentId == enrollment.Id)
                .Select(grade => new CurrentGradeResponse
                {
                    Subject = grade.TeachingAssignment.Subject.SubjectName,

                    PrelimGrade = grade.PrelimGrade,

                    MidtermGrade = grade.MidtermGrade,

                    FinalGrade = grade.FinalGrade,

                    Remarks = grade.Remarks ?? ""
                })
                .OrderBy(x => x.Subject)
                .ToListAsync();
        }
        else
        {
            response.Grades = new List<CurrentGradeResponse>();
        }

        return response;
    }

    public async Task<bool> PromoteStudentAsync(PromoteStudentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == request.StudentId && x.Status == StudentStatus.Active);

        if (student == null)
            return false;

        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(x => x.Id == request.AcademicYearId);

        if (academicYear == null)
            return false;

        // Deactivate current active section assignment
        var activeAssignment = await _context.StudentSectionAssignments
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(po => po.GradeLevel)
            .FirstOrDefaultAsync(x =>
                x.StudentId == request.StudentId &&
                x.IsActive);

        if (activeAssignment != null)
        {
            activeAssignment.IsActive = false;
        }

        // Record the promotion in student history
        var fromGradeLevel = activeAssignment?.Section?.ProgramOffering?.GradeLevel?.Name ?? "Unknown";

        var history = new StudentHistory
        {
            StudentId = request.StudentId,
            Action = "Promoted",
            Description = string.IsNullOrWhiteSpace(request.Notes)
                ? $"Student promoted from {fromGradeLevel} for Academic Year {academicYear.SchoolYear}."
                : $"Student promoted from {fromGradeLevel} for Academic Year {academicYear.SchoolYear}. Notes: {request.Notes}",
            EmployeeId = request.EmployeeId,
            DateOccurred = DateTime.UtcNow
        };

        _context.StudentHistories.Add(history);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.Promote", "Student", request.StudentId.ToString(), history.Description);

        return true;
    }

    public async Task<bool> TransferStudentAsync(TransferStudentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == request.StudentId);

        if (student == null)
            return false;

        // Deactivate current active section assignment
        var activeAssignment = await _context.StudentSectionAssignments
            .FirstOrDefaultAsync(x =>
                x.StudentId == request.StudentId &&
                x.IsActive);

        if (activeAssignment != null)
        {
            activeAssignment.IsActive = false;
        }

        // Mark student as inactive (transferred out)
        student.Status = StudentStatus.Transferred;
        student.UpdatedAt = DateTime.UtcNow;

        // Record the transfer in student history
        var description = $"Student transferred to {request.DestinationSchool}.";
        if (!string.IsNullOrWhiteSpace(request.Reason))
            description += $" Reason: {request.Reason}";

        var history = new StudentHistory
        {
            StudentId = request.StudentId,
            Action = "Transferred Out",
            Description = description,
            EmployeeId = request.EmployeeId,
            DateOccurred = DateTime.UtcNow
        };

        _context.StudentHistories.Add(history);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.Transfer", "Student", request.StudentId.ToString(), description);

        return true;
    }

    public async Task<bool> GraduateStudentAsync(GraduateStudentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == request.StudentId && x.Status == StudentStatus.Active);

        if (student == null)
            return false;

        // Deactivate current active section assignment
        var activeAssignment = await _context.StudentSectionAssignments
            .FirstOrDefaultAsync(x =>
                x.StudentId == request.StudentId &&
                x.IsActive);

        if (activeAssignment != null)
        {
            activeAssignment.IsActive = false;
        }

        // Record the graduation in student history
        student.Status = StudentStatus.Graduated;
        student.UpdatedAt = DateTime.UtcNow;
        
        var description = $"Student graduated — School Year {request.SchoolYear}.";
        if (!string.IsNullOrWhiteSpace(request.Notes))
            description += $" Notes: {request.Notes}";

        var history = new StudentHistory
        {
            StudentId = request.StudentId,
            Action = "Graduated",
            Description = description,
            EmployeeId = request.EmployeeId,
            DateOccurred = DateTime.UtcNow
        };

        _context.StudentHistories.Add(history);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.Graduate", "Student", request.StudentId.ToString(), description);

        return true;
    }
}