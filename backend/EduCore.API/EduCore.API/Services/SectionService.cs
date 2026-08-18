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
        var sections = await _context.Sections
            .Include(x => x.ProgramOffering).ThenInclude(p => p.AcademicYear)
            .Include(x => x.ProgramOffering).ThenInclude(p => p.GradeLevel)
            .Include(x => x.ProgramOffering).ThenInclude(p => p.Program)
            .Include(x => x.Adviser)
            .Include(x => x.TeachingAssignments).ThenInclude(ta => ta.Employee)
            .Include(x => x.TeachingAssignments).ThenInclude(ta => ta.Subject)
            .OrderBy(x => x.ProgramOffering.GradeLevel.DisplayOrder)
            .ThenBy(x => x.SectionName)
            .ToListAsync();

        var result = new List<SectionResponse>();
        foreach (var x in sections)
        {
            result.Add(await MapToSectionResponseAsync(x));
        }
        return result;
    }

    public async Task<SectionResponse?> GetByIdAsync(int id)
    {
        var section = await _context.Sections
            .Include(x => x.ProgramOffering).ThenInclude(p => p.AcademicYear)
            .Include(x => x.ProgramOffering).ThenInclude(p => p.GradeLevel)
            .Include(x => x.ProgramOffering).ThenInclude(p => p.Program)
            .Include(x => x.Adviser)
            .Include(x => x.TeachingAssignments).ThenInclude(ta => ta.Employee)
            .Include(x => x.TeachingAssignments).ThenInclude(ta => ta.Subject)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (section == null)
            return null;

        return await MapToSectionResponseAsync(section);
    }

    public async Task<SectionManagementStatsDto> GetStatsAsync()
    {
        var allSections = await GetAllAsync();
        var total = allSections.Count;
        var active = allSections.Count(s => s.IsActive);
        var full = allSections.Count(s => s.RemainingSlots <= 0);
        var missingAdviser = allSections.Count(s => !s.HasAdviser);
        var missingTeachers = allSections.Count(s => !s.IsTeacherComplete);

        double avgUtil = 0;
        if (total > 0)
        {
            avgUtil = Math.Round(allSections.Average(s => s.Capacity > 0 ? ((double)s.CurrentStudents * 100.0) / s.Capacity : 0), 1);
        }

        return new SectionManagementStatsDto
        {
            TotalSections = total,
            ActiveSections = active,
            FullSections = full,
            SectionsMissingAdviser = missingAdviser,
            SectionsMissingTeachers = missingTeachers,
            AverageUtilization = avgUtil
        };
    }

    public async Task<SectionResponse> CreateAsync(CreateSectionRequest request)
    {
        int programOfferingId = request.ProgramOfferingId ?? 0;

        if (programOfferingId == 0)
        {
            if (!request.AcademicYearId.HasValue || !request.GradeLevelId.HasValue)
            {
                var activeAy = await _context.AcademicYears.FirstOrDefaultAsync(ay => ay.Status == Enums.AcademicYearStatus.Current);
                if (activeAy == null) throw new InvalidOperationException("Active Academic Year not found. Please specify Academic Year.");
                request.AcademicYearId ??= activeAy.Id;
            }

            if (!request.GradeLevelId.HasValue)
                throw new InvalidOperationException("Grade Level is required.");

            var po = await _context.ProgramOfferings.FirstOrDefaultAsync(p =>
                p.AcademicYearId == request.AcademicYearId.Value &&
                p.GradeLevelId == request.GradeLevelId.Value &&
                p.ProgramId == request.ProgramId);

            if (po == null)
            {
                po = new ProgramOffering
                {
                    AcademicYearId = request.AcademicYearId.Value,
                    GradeLevelId = request.GradeLevelId.Value,
                    ProgramId = request.ProgramId,
                    IsActive = true
                };
                _context.ProgramOfferings.Add(po);
                await _context.SaveChangesAsync();
            }
            programOfferingId = po.Id;
        }

        var exists = await _context.Sections.AnyAsync(x =>
            x.ProgramOfferingId == programOfferingId &&
            x.SectionName.ToLower() == request.SectionName.ToLower());

        if (exists)
            throw new InvalidOperationException($"Section '{request.SectionName}' already exists for the selected program offering.");

        var section = new Section
        {
            ProgramOfferingId = programOfferingId,
            SectionName = request.SectionName,
            Capacity = request.Capacity,
            AdviserEmployeeId = request.AdviserEmployeeId,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Sections.Add(section);
        await _context.SaveChangesAsync();

        var poOffering = await _context.ProgramOfferings.FindAsync(programOfferingId);
        if (poOffering != null)
        {
            var requiredSubjects = await _context.Subjects
                .Where(s => s.GradeLevelId == poOffering.GradeLevelId && s.IsActive)
                .ToListAsync();

            foreach (var sub in requiredSubjects)
            {
                var taExists = await _context.TeachingAssignments.AnyAsync(t => t.SectionId == section.Id && t.SubjectId == sub.Id);
                if (!taExists)
                {
                    _context.TeachingAssignments.Add(new TeachingAssignment
                    {
                        SectionId = section.Id,
                        SubjectId = sub.Id,
                        EmployeeId = 0,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        return (await GetByIdAsync(section.Id))!;
    }

    public async Task<SectionResponse?> UpdateAsync(int id, UpdateSectionRequest request)
    {
        var section = await _context.Sections.FindAsync(id);
        if (section == null)
            return null;

        int programOfferingId = request.ProgramOfferingId ?? section.ProgramOfferingId;

        if (request.AcademicYearId.HasValue && request.GradeLevelId.HasValue)
        {
            var po = await _context.ProgramOfferings.FirstOrDefaultAsync(p =>
                p.AcademicYearId == request.AcademicYearId.Value &&
                p.GradeLevelId == request.GradeLevelId.Value &&
                p.ProgramId == request.ProgramId);

            if (po == null)
            {
                po = new ProgramOffering
                {
                    AcademicYearId = request.AcademicYearId.Value,
                    GradeLevelId = request.GradeLevelId.Value,
                    ProgramId = request.ProgramId,
                    IsActive = true
                };
                _context.ProgramOfferings.Add(po);
                await _context.SaveChangesAsync();
            }
            programOfferingId = po.Id;
        }

        section.ProgramOfferingId = programOfferingId;
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

    public async Task<bool> ToggleStatusAsync(int id)
    {
        var section = await _context.Sections.FindAsync(id);
        if (section == null)
            return false;

        section.IsActive = !section.IsActive;
        section.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignTeacherAsync(int sectionId, AssignSectionTeacherRequest request)
    {
        var section = await _context.Sections.FindAsync(sectionId);
        if (section == null) return false;

        if (request.EmployeeId > 0)
        {
            var emp = await _context.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == request.EmployeeId);
            if (emp == null) throw new InvalidOperationException("Selected employee does not exist.");

            bool isTeacherRole = emp.Role == UserRole.Teacher || (emp.User != null && emp.User.Role == UserRole.Teacher);
            if (!isTeacherRole)
            {
                throw new InvalidOperationException("INVALID_TEACHER_ASSIGNMENT: Selected employee is not a faculty teacher.");
            }
        }


        var ta = await _context.TeachingAssignments
            .FirstOrDefaultAsync(t => t.SectionId == sectionId && t.SubjectId == request.SubjectId);

        if (ta != null)
        {
            ta.EmployeeId = request.EmployeeId;
            ta.IsActive = true;
        }
        else
        {
            _context.TeachingAssignments.Add(new TeachingAssignment
            {
                SectionId = sectionId,
                SubjectId = request.SubjectId,
                EmployeeId = request.EmployeeId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignSubjectsAsync(int sectionId, AssignSectionSubjectsRequest request)
    {
        var section = await _context.Sections.FindAsync(sectionId);
        if (section == null) return false;

        foreach (var subjectId in request.SubjectIds)
        {
            var exists = await _context.TeachingAssignments.AnyAsync(t => t.SectionId == sectionId && t.SubjectId == subjectId);
            if (!exists)
            {
                _context.TeachingAssignments.Add(new TeachingAssignment
                {
                    SectionId = sectionId,
                    SubjectId = subjectId,
                    EmployeeId = 0,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public class SectionReadinessCalculationResult
    {
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int CurrentCount { get; set; }
        public int RemainingSlots { get; set; }
        public int EnrollmentPercentage { get; set; }
        public int? AdviserEmployeeId { get; set; }
        public string AdviserName { get; set; } = string.Empty;
        public bool HasAdviser { get; set; }

        public List<Subject> RequiredSubjects { get; set; } = new();
        public List<SectionSubjectDetailDto> SubjectDetails { get; set; } = new();

        public int AssignedSubjectsCount { get; set; }
        public int RequiredSubjectsCount { get; set; }
        public int AssignedTeachersCount { get; set; }
        public int RequiredTeachersCount { get; set; }

        public bool IsSubjectComplete { get; set; }
        public bool IsTeacherComplete { get; set; }
        public bool IsActive { get; set; }

        public string ReadinessStatus { get; set; } = string.Empty;
        public string SectionHealth { get; set; } = string.Empty;

        public List<string> ReasonsNotSelectable { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public bool IsSelectable { get; set; }
    }

    public async Task<SectionReadinessCalculationResult> CalculateSectionConfigurationAsync(Section x)
    {
        var currentCount = await _context.StudentSectionAssignments
            .CountAsync(sa => sa.SectionId == x.Id && sa.IsActive);

        var remaining = Math.Max(0, x.Capacity - currentCount);
        var pct = x.Capacity > 0 ? (currentCount * 100) / x.Capacity : 100;

        // Authoritative query: ALWAYS query database directly with AsNoTracking() + Include(ta => ta.Employee).ThenInclude(e => e.User) + Include(ta => ta.Subject)
        // Never rely on un-included or incomplete navigation collections on x.TeachingAssignments.
        var activeTas = await _context.TeachingAssignments
            .AsNoTracking()
            .Include(ta => ta.Employee)
                .ThenInclude(e => e!.User)
            .Include(ta => ta.Subject)
            .Where(ta => ta.SectionId == x.Id && ta.IsActive)
            .ToListAsync();


        int gradeLevelId = x.ProgramOffering?.GradeLevelId ?? 0;
        if (gradeLevelId == 0 && x.ProgramOfferingId > 0)
        {
            var po = await _context.ProgramOfferings.AsNoTracking().FirstOrDefaultAsync(p => p.Id == x.ProgramOfferingId);
            if (po != null) gradeLevelId = po.GradeLevelId;
        }

        var requiredSubjects = gradeLevelId > 0
            ? await _context.Subjects
                .AsNoTracking()
                .Where(sub => sub.GradeLevelId == gradeLevelId && sub.IsActive)
                .OrderBy(sub => sub.SubjectCode)
                .ToListAsync()
            : new List<Subject>();

        var subjectDetails = new List<SectionSubjectDetailDto>();
        foreach (var reqSub in requiredSubjects)
        {
            var matchingTa = activeTas.FirstOrDefault(ta => ta.SubjectId == reqSub.Id);
            var hasTeacher = matchingTa != null && matchingTa.EmployeeId > 0 && matchingTa.Employee != null;
            var teacherName = hasTeacher
                ? $"{matchingTa!.Employee.FirstName} {matchingTa.Employee.LastName}".Trim()
                : "No Teacher Assigned";

            subjectDetails.Add(new SectionSubjectDetailDto
            {
                SubjectId = reqSub.Id,
                SubjectCode = reqSub.SubjectCode,
                SubjectName = reqSub.SubjectName,
                Units = reqSub.Units,
                IsCoreSubject = reqSub.IsCoreSubject,
                TeacherEmployeeId = hasTeacher ? matchingTa!.EmployeeId : null,
                TeacherName = teacherName,
                HasTeacher = hasTeacher
            });
        }

        var assignedSubjectsCount = subjectDetails.Count;
        var requiredSubjectsCount = requiredSubjects.Count > 0 ? requiredSubjects.Count : Math.Max(1, assignedSubjectsCount);
        var assignedTeachersCount = subjectDetails.Count(s => s.HasTeacher);
        var requiredTeachersCount = requiredSubjectsCount;

        var isSubComplete = assignedSubjectsCount >= requiredSubjectsCount;
        var isTeacherComplete = assignedTeachersCount >= requiredTeachersCount;
        var hasAdviser = x.AdviserEmployeeId != null && x.AdviserEmployeeId != 0;

        var reasonsNotSelectable = new List<string>();
        var warnings = new List<string>();

        if (!x.IsActive)
        {
            reasonsNotSelectable.Add("Section is inactive or closed.");
        }

        if (!hasAdviser)
        {
            reasonsNotSelectable.Add("Adviser teacher has not been assigned.");
        }

        if (currentCount >= x.Capacity)
        {
            reasonsNotSelectable.Add("Section has reached maximum capacity.");
        }

        if (!isSubComplete)
        {
            reasonsNotSelectable.Add($"Incomplete subject configuration ({assignedSubjectsCount}/{requiredSubjectsCount} assigned).");
        }

        if (!isTeacherComplete)
        {
            reasonsNotSelectable.Add($"Missing teacher assignments ({assignedTeachersCount}/{requiredTeachersCount} teachers assigned).");
        }

        if (remaining > 0 && remaining <= 3)
        {
            warnings.Add($"Only {remaining} slots remaining.");
        }

        var isSelectable = !reasonsNotSelectable.Any();

        string readiness;
        if (currentCount >= x.Capacity) readiness = "Full";
        else if (!hasAdviser || !isSubComplete || !isTeacherComplete) readiness = "Incomplete";
        else if (warnings.Any()) readiness = "Warning";
        else readiness = "Ready";

        string health;
        if (readiness == "Incomplete") health = "Configuration Required";
        else if (readiness == "Full" || readiness == "Warning") health = "Needs Attention";
        else if (pct >= 80) health = "Good";
        else health = "Excellent";

        var adviserName = x.Adviser != null ? $"{x.Adviser.FirstName} {x.Adviser.LastName}".Trim() : "Unassigned";

        return new SectionReadinessCalculationResult
        {
            SectionId = x.Id,
            SectionName = x.SectionName,
            Capacity = x.Capacity,
            CurrentCount = currentCount,
            RemainingSlots = remaining,
            EnrollmentPercentage = pct,
            AdviserEmployeeId = x.AdviserEmployeeId,
            AdviserName = adviserName,
            HasAdviser = hasAdviser,
            RequiredSubjects = requiredSubjects,
            SubjectDetails = subjectDetails,
            AssignedSubjectsCount = assignedSubjectsCount,
            RequiredSubjectsCount = requiredSubjectsCount,
            AssignedTeachersCount = assignedTeachersCount,
            RequiredTeachersCount = requiredTeachersCount,
            IsSubjectComplete = isSubComplete,
            IsTeacherComplete = isTeacherComplete,
            IsActive = x.IsActive,
            ReadinessStatus = readiness,
            SectionHealth = health,
            ReasonsNotSelectable = reasonsNotSelectable,
            Warnings = warnings,
            IsSelectable = isSelectable
        };
    }

    private async Task<SectionResponse> MapToSectionResponseAsync(Section x)
    {
        var config = await CalculateSectionConfigurationAsync(x);

        var enrolledStudents = await _context.StudentSectionAssignments
            .Include(sa => sa.Student)
            .Where(sa => sa.SectionId == x.Id && sa.IsActive)
            .Select(sa => new SectionEnrolledStudentDto
            {
                StudentId = sa.StudentId,
                StudentNumber = sa.Student.StudentNumber,
                FullName = $"{sa.Student.FirstName} {sa.Student.LastName}",
                Gender = sa.Student.Gender.ToString(),
                AssignedAt = sa.AssignedAt
            })
            .ToListAsync();

        return new SectionResponse
        {
            Id = x.Id,
            ProgramOfferingId = x.ProgramOfferingId,
            ProgramOfferingName = x.ProgramOffering?.GradeLevel?.Name ?? "",
            AcademicYearId = x.ProgramOffering?.AcademicYearId ?? 0,
            SchoolYear = x.ProgramOffering?.AcademicYear?.SchoolYear ?? "",
            Semester = x.ProgramOffering?.AcademicYear?.CurrentSemester ?? "1st Semester",
            GradeLevelId = x.ProgramOffering?.GradeLevelId ?? 0,
            GradeLevelName = x.ProgramOffering?.GradeLevel?.Name ?? "",
            ProgramId = x.ProgramOffering?.ProgramId,
            TrackCode = x.ProgramOffering?.Program?.Code ?? "Academic",
            StrandCode = x.ProgramOffering?.Program?.Name ?? "General",
            SectionName = x.SectionName,
            Capacity = x.Capacity,
            CurrentStudents = config.CurrentCount,
            RemainingSlots = config.RemainingSlots,
            AdviserEmployeeId = config.AdviserEmployeeId,
            AdviserName = config.AdviserName,
            HasAdviser = config.HasAdviser,
            IsActive = config.IsActive,
            Status = config.IsActive ? "Active" : "Inactive",
            ReadinessStatus = config.ReadinessStatus,
            SectionHealth = config.SectionHealth,
            AssignedSubjectsCount = config.AssignedSubjectsCount,
            RequiredSubjectsCount = config.RequiredSubjectsCount,
            AssignedTeachersCount = config.AssignedTeachersCount,
            RequiredTeachersCount = config.RequiredTeachersCount,
            IsSubjectComplete = config.IsSubjectComplete,
            IsTeacherComplete = config.IsTeacherComplete,
            Subjects = config.SubjectDetails,
            EnrolledStudents = enrolledStudents
        };
    }


    private static bool secGradeIsSeniorHigh(string gradeName)
    {
        if (string.IsNullOrWhiteSpace(gradeName)) return false;
        var g = gradeName.Trim().ToLower();
        return g.Contains("11") || g.Contains("12") || g.Contains("senior");
    }

    public async Task<List<AvailableSectionResponse>> GetAvailableSectionsForEnrollmentAsync(int applicationId)
    {
        var app = await _context.EnrollmentApplications.FirstOrDefaultAsync(a => a.Id == applicationId);
        if (app == null) return new List<AvailableSectionResponse>();

        var activeSy = await _context.AcademicYears.FirstOrDefaultAsync(sy => sy.Status == Enums.AcademicYearStatus.Current);
        if (activeSy == null) return new List<AvailableSectionResponse>();

        var allSections = await _context.Sections
            .Include(s => s.ProgramOffering)
                .ThenInclude(po => po.GradeLevel)
            .Include(s => s.ProgramOffering)
                .ThenInclude(po => po.Program)
            .Include(s => s.Adviser)
            .Include(s => s.TeachingAssignments)
                .ThenInclude(ta => ta.Subject)
            .Include(s => s.TeachingAssignments)
                .ThenInclude(ta => ta.Employee)
            .Where(s => s.ProgramOffering.AcademicYearId == activeSy.Id)
            .ToListAsync();

        var gradeQuery = app.GradeApplyingFor.ToLower().Trim();
        var isSeniorHigh = secGradeIsSeniorHigh(app.GradeApplyingFor);

        var relevantSections = allSections.Where(s => {
            var secGrade = s.ProgramOffering.GradeLevel.Name.ToLower();
            bool gradeMatch = secGrade.Contains(gradeQuery) || gradeQuery.Contains(secGrade);
            if (!gradeMatch) return false;

            if (!isSeniorHigh)
            {
                // For Grades 1-10: Section ProgramId must be null (No Strand)
                return s.ProgramOffering.ProgramId == null;
            }
            else
            {
                // For Grades 11-12: Section ProgramId must match applicant's selected Strand
                if (string.IsNullOrWhiteSpace(app.Strand)) return false;
                var appStrand = app.Strand.Trim().ToLower();
                var secProgramCode = s.ProgramOffering.Program?.Code?.ToLower() ?? "";
                var secProgramName = s.ProgramOffering.Program?.Name?.ToLower() ?? "";
                return secProgramCode.Contains(appStrand) || secProgramName.Contains(appStrand) || appStrand.Contains(secProgramCode);
            }
        }).ToList();

        if (!relevantSections.Any())
        {
            return new List<AvailableSectionResponse>();
        }

        var result = new List<AvailableSectionResponse>();

        foreach (var sec in relevantSections)
        {
            var config = await CalculateSectionConfigurationAsync(sec);

            result.Add(new AvailableSectionResponse
            {
                SectionId = sec.Id,
                SectionName = sec.SectionName,
                Recommended = false,
                ReadinessStatus = config.ReadinessStatus,
                SectionHealth = config.SectionHealth,
                RemainingSlots = config.RemainingSlots,
                Capacity = sec.Capacity,
                CurrentEnrollment = config.CurrentCount,
                EnrollmentPercentage = config.EnrollmentPercentage,
                AdviserName = config.AdviserName,
                AdviserEmployeeId = sec.AdviserEmployeeId,
                HasAdviser = config.HasAdviser,
                AssignedSubjects = config.AssignedSubjectsCount,
                RequiredSubjects = config.RequiredSubjectsCount,
                AssignedTeachers = config.AssignedTeachersCount,
                RequiredTeachers = config.RequiredTeachersCount,
                IsSubjectComplete = config.IsSubjectComplete,
                IsTeacherComplete = config.IsTeacherComplete,
                SchoolYear = activeSy.SchoolYear,
                GradeLevelName = sec.ProgramOffering?.GradeLevel?.Name ?? "Grade Level",
                TrackCode = sec.ProgramOffering?.Program?.Code ?? "Academic",
                StrandCode = sec.ProgramOffering?.Program?.Name ?? "General",
                Subjects = config.SubjectDetails,
                Warnings = config.Warnings,
                ReasonsNotSelectable = config.ReasonsNotSelectable,
                IsSelectable = config.IsSelectable
            });
        }

        // DETERMINISTIC RECOMMENDATION ENGINE & LOAD BALANCING
        var selectable = result.Where(r => r.IsSelectable).OrderBy(r => r.EnrollmentPercentage).ThenByDescending(r => r.RemainingSlots).ThenBy(r => r.SectionName).ToList();

        if (selectable.Any())
        {
            var best = selectable.First();
            best.Recommended = true;
            best.RecommendationSummary = "Recommended by Registrar Decision Engine";
            best.RecommendationReasons = new List<string>
            {
                $"Lowest enrollment ratio ({best.EnrollmentPercentage}%) among eligible sections",
                $"Complete subject lineup ({best.AssignedSubjects} / {best.RequiredSubjects} Assigned)",
                $"All teachers assigned ({best.AssignedTeachers} / {best.RequiredTeachers} Assigned)",
                $"Assigned Adviser: {best.AdviserName}",
                $"{best.RemainingSlots} slots remaining available"
            };
        }

        // Sort output: Recommended first, then selectable by lowest enrollment ratio, then unselectable
        return result
            .OrderByDescending(r => r.Recommended)
            .ThenByDescending(r => r.IsSelectable)
            .ThenBy(r => r.EnrollmentPercentage)
            .ThenBy(r => r.SectionName)
            .ToList();
    }

    public async Task<SectionValidationResultDto> ValidateSectionForEnrollmentAsync(int applicationId, int sectionId)
    {
        var errors = new List<string>();

        var app = await _context.EnrollmentApplications.FirstOrDefaultAsync(a => a.Id == applicationId);
        if (app == null)
        {
            errors.Add("Application record not found.");
            return new SectionValidationResultDto { IsValid = false, Code = "SECTION_VALIDATION_FAILED", Errors = errors };
        }

        if (app.Status == Enums.EnrollmentApplicationStatus.Enrolled)
        {
            errors.Add("Applicant is already officially enrolled.");
        }

        var existingAssignment = await _context.StudentSectionAssignments.FirstOrDefaultAsync(sa => sa.StudentId == app.StudentId && sa.IsActive);
        if (existingAssignment != null)
        {
            errors.Add("Applicant already belongs to another section.");
        }

        var section = await _context.Sections
            .Include(s => s.ProgramOffering)
                .ThenInclude(po => po.GradeLevel)
            .Include(s => s.Adviser)
            .Include(s => s.TeachingAssignments)
                .ThenInclude(ta => ta.Subject)
            .Include(s => s.TeachingAssignments)
                .ThenInclude(ta => ta.Employee)
            .FirstOrDefaultAsync(s => s.Id == sectionId);

        if (section == null)
        {
            errors.Add("Selected section does not exist.");
            return new SectionValidationResultDto { IsValid = false, Code = "SECTION_VALIDATION_FAILED", Errors = errors };
        }

        var config = await CalculateSectionConfigurationAsync(section);

        errors.AddRange(config.ReasonsNotSelectable);

        return new SectionValidationResultDto
        {
            IsValid = config.IsSelectable && !errors.Any(),
            Code = (config.IsSelectable && !errors.Any()) ? "VALIDATION_PASSED" : "SECTION_VALIDATION_FAILED",
            Errors = errors.Distinct().ToList()
        };
    }
}