using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
namespace EduCore.API.Data;

public class EduCoreDbContext : DbContext
{
    public EduCoreDbContext(DbContextOptions<EduCoreDbContext> options)
        : base(options)
    {
    }

    public DbSet<GradeLevel> GradeLevels { get; set; }

    public DbSet<AcademicProgram> Programs { get; set; }

    public DbSet<ProgramOffering> ProgramOfferings { get; set; }
    public DbSet<StudentHistory> StudentHistories => Set<StudentHistory>();

    public DbSet<StudentSectionAssignment> StudentSectionAssignments
    => Set<StudentSectionAssignment>();

    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<EnrollmentApplication> EnrollmentApplications
     => Set<EnrollmentApplication>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<AcademicYear> AcademicYears { get; set; }
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<TeachingAssignment> TeachingAssignments => Set<TeachingAssignment>();

    // Accounting
    public DbSet<SchoolFee> SchoolFees => Set<SchoolFee>();
    public DbSet<StudentBill> StudentBills => Set<StudentBill>();
    public DbSet<StudentBillItem> StudentBillItems => Set<StudentBillItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<OfficialReceipt> OfficialReceipts => Set<OfficialReceipt>();

    // System Settings, Admission Tracking & Logs
    public DbSet<SchoolSetting> SchoolSettings => Set<SchoolSetting>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();
    public DbSet<PasswordResetCode> PasswordResetCodes => Set<PasswordResetCode>();
    public DbSet<AdmissionDocumentType> AdmissionDocumentTypes => Set<AdmissionDocumentType>();
    public DbSet<EnrollmentApplicationDocument> EnrollmentApplicationDocuments => Set<EnrollmentApplicationDocument>();
    public DbSet<DocumentSubmissionAppointment> DocumentSubmissionAppointments => Set<DocumentSubmissionAppointment>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<EnrollmentHistory> EnrollmentHistories => Set<EnrollmentHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EduCoreDbContext).Assembly);

        // Unique Constraints for Production Data Integrity
        modelBuilder.Entity<Student>().HasIndex(s => s.StudentNumber).IsUnique();
        modelBuilder.Entity<StudentBill>().HasIndex(b => b.BillNumber).IsUnique();
        modelBuilder.Entity<OfficialReceipt>().HasIndex(r => r.ReceiptNumber).IsUnique();
        modelBuilder.Entity<EnrollmentApplication>().HasIndex(a => a.ApplicationNumber).IsUnique();
        modelBuilder.Entity<EnrollmentApplication>().HasIndex(a => a.VerificationSlipNumber).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // Prevent destructive cascade deletes on core institutional entities
        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.AcademicYear)
            .WithMany()
            .HasForeignKey(e => e.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasOne(s => s.Program)
                .WithMany()
                .HasForeignKey(s => s.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(s => s.CurriculumVersion)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("MATATAG-K10");

            entity.Property(s => s.SubjectType)
                .IsRequired()
                .HasMaxLength(30)
                .HasDefaultValue("Core");

            entity.Property(s => s.DomainCategory)
                .HasMaxLength(50);
        });

        // Seed default configurable Admission Document Types
        modelBuilder.Entity<AdmissionDocumentType>().HasData(
            new AdmissionDocumentType { Id = 1, Name = "PSA Authenticated Birth Certificate", IsRequired = true, ApplicableEducationLevel = "All", DisplayOrder = 1, IsActive = true },
            new AdmissionDocumentType { Id = 2, Name = "Official Report Card (Form 138 / SF9)", IsRequired = true, ApplicableEducationLevel = "All", DisplayOrder = 2, IsActive = true },
            new AdmissionDocumentType { Id = 3, Name = "Transcript of Records (Form 137 / SF10)", IsRequired = true, ApplicableEducationLevel = "All", DisplayOrder = 3, IsActive = true },
            new AdmissionDocumentType { Id = 4, Name = "Certificate of Good Moral Character", IsRequired = true, ApplicableEducationLevel = "All", DisplayOrder = 4, IsActive = true },
            new AdmissionDocumentType { Id = 5, Name = "Recent 2×2 ID Pictures (4 Copies, White BG)", IsRequired = true, ApplicableEducationLevel = "All", DisplayOrder = 5, IsActive = true },
            new AdmissionDocumentType { Id = 6, Name = "JHS Certificate of Completion", IsRequired = true, ApplicableEducationLevel = "SeniorHighSchool", DisplayOrder = 6, IsActive = true },
            new AdmissionDocumentType { Id = 7, Name = "ESC / QVR Voucher Certificate (if applicable)", IsRequired = false, ApplicableEducationLevel = "SeniorHighSchool", DisplayOrder = 7, IsActive = true }
        );
    }
}   