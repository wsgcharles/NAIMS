using EduCore.API.Data;
using EduCore.API.Helpers;
using EduCore.API.Seeders;
using EduCore.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using EduCore.API.Interfaces;

var builder = WebApplication.CreateBuilder(args);

#region Database

builder.Services.AddDbContext<EduCoreDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

#endregion

#region JWT Settings

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

#endregion

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

// Email Subsystem & Background Worker
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<EmailBackgroundWorker>();
#endregion

#region CORS

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

#endregion

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

#region Controllers

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

#endregion

#region Swagger

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Noah's Academy Integrated Management System API",
        Version = "v1",
        Description = "Backend API for NAIMS"
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

var app = builder.Build();

#region Seed Database

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var db = services.GetRequiredService<EduCoreDbContext>();
    var passwordService = services.GetRequiredService<IPasswordService>();

    await DatabaseSeeder.SeedSuperAdminAsync(db, passwordService);
}

#endregion

#region HTTP Pipeline

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

#endregion