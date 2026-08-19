using EduCore.API.Data;
using EduCore.API.Helpers;
using EduCore.API.Interfaces;
using EduCore.API.Seeders;
using EduCore.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// ─── Startup Configuration Validation ────────────────────────────────────────
// Fail fast on startup if any required secret is missing or still a placeholder.
// This prevents a silent misconfiguration in production (e.g. sending with a wrong key).
ValidateConfiguration(builder.Configuration);

// ─── Database ─────────────────────────────────────────────────────────────────

#region Database

builder.Services.AddDbContext<EduCoreDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

#endregion

// ─── JWT Settings ─────────────────────────────────────────────────────────────

#region JWT Settings

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

#endregion

// ─── Dependency Injection ──────────────────────────────────────────────────────

#region Dependency Injection

builder.Services.AddScoped<IStudentSectionAssignmentService,
    StudentSectionAssignmentService>();

builder.Services.AddScoped<IStudentHistoryService, StudentHistoryService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IRegistrarService, RegistrarService>();
builder.Services.AddScoped<ITeachingAssignmentService, TeachingAssignmentService>();
builder.Services.AddScoped<IStudentDashboardService, StudentDashboardService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<ITeacherDashboardService, TeacherDashboardService>();
builder.Services.AddScoped<IGradeApprovalService, GradeApprovalService>();
builder.Services.AddScoped<IGradeService, GradeService>();
builder.Services.AddScoped<ISectionService, SectionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<NumberGeneratorService>();
builder.Services.AddScoped<IAcademicYearService, AcademicYearService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IParentPortalService, ParentPortalService>();
builder.Services.AddScoped<IGradeLevelService, GradeLevelService>();
builder.Services.AddScoped<IAcademicProgramService, AcademicProgramService>();
builder.Services.AddScoped<IAccountingService, AccountingService>();
builder.Services.AddScoped<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddScoped<IPasswordPolicyService, PasswordPolicyService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IClassScheduleService, ClassScheduleService>();
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();

// Email Subsystem & Background Worker
builder.Services.AddHttpClient();
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<EmailBackgroundWorker>();

// Rate Limiting
// Protects sensitive unauthenticated endpoints from brute-force and flooding.
builder.Services.AddRateLimiter(options =>
{
    // Forgot Password: max 3 requests per IP per 15 minutes.
    // Prevents email flooding, brute-force token guessing, and Gmail quota exhaustion.
    options.AddFixedWindowLimiter("forgot-password", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(15);
        opt.PermitLimit = 3;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    // Reset Password: max 5 attempts per IP per 10 minutes.
    // Prevents brute-forcing the reset token from the URL.
    options.AddFixedWindowLimiter("reset-password", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(10);
        opt.PermitLimit = 5;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    // Login: max 10 attempts per IP per 5 minutes (complementary to account lockout).
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(5);
        opt.PermitLimit = 10;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

#endregion

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Environment-aware: Development allows localhost, Production restricts to school domains.

#region CORS

var allowedOrigins = builder.Configuration
    .GetSection("AppSettings:AllowedOrigins")
    .Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow configured localhost origins
            policy
                .WithOrigins(allowedOrigins.Length > 0
                    ? allowedOrigins
                    : ["http://localhost:5173"])
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
        else
        {
            // In production, restrict to the school's actual domains only.
            // Never use AllowAnyOrigin() in production — it removes CORS protection entirely.
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
    });
});

#endregion

// ─── JWT Authentication ────────────────────────────────────────────────────────

#region JWT Authentication

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"]!))
        };
    });

#endregion

// ─── Controllers ──────────────────────────────────────────────────────────────

#region Controllers

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

#endregion

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────

#region Swagger

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Noah's Academy Student Information System API",
        Version = "v1",
        Description = "Backend API for NAISIS — Development only. Swagger UI is disabled in production."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your JWT token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

#endregion

// ─── Build App ────────────────────────────────────────────────────────────────

var app = builder.Build();

// ─── Seed Database ────────────────────────────────────────────────────────────

#region Seed Database

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<EduCoreDbContext>();
    var passwordService = services.GetRequiredService<IPasswordService>();
    await DatabaseSeeder.SeedSuperAdminAsync(db, passwordService);
}

#endregion

// ─── HTTP Pipeline ────────────────────────────────────────────────────────────

#region HTTP Pipeline

// Global Centralized Exception Handling Middleware & Correlation Tracking
app.UseMiddleware<EduCore.API.Middleware.GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // HSTS: Instruct browsers to always use HTTPS for this domain.
    // max-age=31536000 = 1 year, includeSubDomains = true by default in ASP.NET Core.
    app.UseHsts();
}

// HTTPS Redirection — enabled in Development only.
// In Production on Render/Railway, TLS is terminated at the load balancer edge.
// The container receives plain HTTP internally, so redirecting HTTP→HTTPS
// inside the container causes an infinite redirect loop. Render provides HTTPS
// to external clients automatically without any action inside the container.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Security Headers — applied to every response.
// These headers defend against common web attacks at zero cost.
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;

    // Prevent MIME-type sniffing — forces browser to use the declared Content-Type.
    headers["X-Content-Type-Options"] = "nosniff";

    // Block clickjacking — prevents this API from being embedded in iframes.
    headers["X-Frame-Options"] = "DENY";

    // Enable XSS filter in older browsers (modern browsers use CSP instead).
    headers["X-XSS-Protection"] = "1; mode=block";

    // Control referrer information sent with requests.
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

    // Prevent browsers from caching sensitive API responses.
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
    headers["Pragma"] = "no-cache";

    await next();
});

// CORS must be registered BEFORE the rate limiter.
// If the rate limiter runs first and returns 429, it short-circuits the pipeline
// before CORS can add Access-Control-Allow-Origin. The browser then reports a
// "CORS error" instead of the real "429 Too Many Requests", hiding the actual cause.
app.UseCors("AppCors");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// ─── Health Check (Liveness Probe) ────────────────────────────────────────────
// Minimal endpoint used by cloud hosting providers (Render, Railway) to verify
// the API process is alive. Returns 200 OK with a simple status object.
// Does NOT expose database credentials, connection strings, or internal state.
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "EduCore API",
    timestamp = DateTime.UtcNow
})).AllowAnonymous();

app.MapControllers();


app.Run();

#endregion

// ─── Startup Configuration Validator ─────────────────────────────────────────

/// <summary>
/// Validates that all required configuration values are present and not placeholder values.
/// Called at startup so that a misconfigured deployment fails immediately with a clear error,
/// rather than silently failing later when an email is attempted or a JWT is issued.
/// </summary>
static void ValidateConfiguration(IConfiguration configuration)
{
    var errors = new List<string>();

    // JWT Key — must exist and be at least 32 characters (256-bit minimum for HS256).
    var jwtKey = configuration["Jwt:Key"];
    if (string.IsNullOrWhiteSpace(jwtKey))
        errors.Add("Jwt:Key is missing. Set via environment variable: ASPNETCORE_Jwt__Key");
    else if (jwtKey.StartsWith("SET_VIA_ENVIRONMENT"))
        errors.Add("Jwt:Key is still a placeholder. Set the real key via: ASPNETCORE_Jwt__Key");
    else if (jwtKey.Length < 32)
        errors.Add($"Jwt:Key is too short ({jwtKey.Length} chars). Minimum 32 characters required for HS256.");

    // SMTP or Brevo API — required for password reset and welcome emails.
    var brevoApiKey = configuration["SmtpSettings:BrevoApiKey"];
    if (string.IsNullOrWhiteSpace(brevoApiKey) || brevoApiKey.StartsWith("SET_VIA_ENVIRONMENT"))
    {
        var smtpPassword = configuration["SmtpSettings:Password"];
        if (string.IsNullOrWhiteSpace(smtpPassword))
            errors.Add("SmtpSettings:Password is missing (or provide SmtpSettings:BrevoApiKey). Set via: ASPNETCORE_SmtpSettings__Password or ASPNETCORE_SmtpSettings__BrevoApiKey");
        else if (smtpPassword.StartsWith("SET_VIA_ENVIRONMENT"))
            errors.Add("SmtpSettings:Password is still a placeholder. Set: ASPNETCORE_SmtpSettings__Password or ASPNETCORE_SmtpSettings__BrevoApiKey");

        var smtpUsername = configuration["SmtpSettings:Username"];
        if (string.IsNullOrWhiteSpace(smtpUsername))
            errors.Add("SmtpSettings:Username is missing. Set via: ASPNETCORE_SmtpSettings__Username");
        else if (smtpUsername.StartsWith("SET_VIA_ENVIRONMENT"))
            errors.Add("SmtpSettings:Username is still a placeholder. Set: ASPNETCORE_SmtpSettings__Username");
    }

    var smtpSender = configuration["SmtpSettings:SenderEmail"];
    if (string.IsNullOrWhiteSpace(smtpSender))
        errors.Add("SmtpSettings:SenderEmail is missing. Set via: ASPNETCORE_SmtpSettings__SenderEmail");
    else if (smtpSender.StartsWith("SET_VIA_ENVIRONMENT"))
        errors.Add("SmtpSettings:SenderEmail is still a placeholder.");

    // Connection string — database must be configured.
    var connStr = configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connStr))
        errors.Add("ConnectionStrings:DefaultConnection is missing.");

    // Frontend URL — required for generating reset links.
    var frontendUrl = configuration["AppSettings:FrontendBaseUrl"];
    if (string.IsNullOrWhiteSpace(frontendUrl))
        errors.Add("AppSettings:FrontendBaseUrl is missing.");

    if (errors.Count > 0)
    {
        var message = string.Join(Environment.NewLine, errors.Select(e => $"  ❌ {e}"));
        throw new InvalidOperationException(
            $"""
            
            ═══════════════════════════════════════════════════════════
            EduCore API — STARTUP CONFIGURATION VALIDATION FAILED
            ═══════════════════════════════════════════════════════════
            The following required configuration values are missing or
            still set to placeholder values:
            
            {message}
            
            How to fix:
              1. Copy appsettings.template.json → appsettings.Development.json
              2. Fill in the real values (never commit appsettings.Development.json)
              3. OR set environment variables (recommended for production)
            
            Example environment variables:
              ASPNETCORE_Jwt__Key=<your-32+-char-secret>
              ASPNETCORE_SmtpSettings__Username=noahsacademy.edu.ph@gmail.com
              ASPNETCORE_SmtpSettings__Password=<gmail-app-password>
              ASPNETCORE_SmtpSettings__SenderEmail=noahsacademy.edu.ph@gmail.com
            ═══════════════════════════════════════════════════════════
            """);
    }
}