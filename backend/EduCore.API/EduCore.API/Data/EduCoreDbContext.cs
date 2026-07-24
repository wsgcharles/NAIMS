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

    // System Settings & Logs
    public DbSet<SchoolSetting> SchoolSettings => Set<SchoolSetting>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EduCoreDbContext).Assembly);
    }
}   