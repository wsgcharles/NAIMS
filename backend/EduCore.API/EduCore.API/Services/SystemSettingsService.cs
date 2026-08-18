using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class SystemSettingsService : ISystemSettingsService
{
    private readonly EduCoreDbContext _context;

    public SystemSettingsService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<SchoolSettingResponse> GetSettingsAsync()
    {
        var settings = await _context.SchoolSettings
            .Include(x => x.CurrentAcademicYear)
            .FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new SchoolSetting
            {
                SchoolName = "Noah's Academy Student Information System",
                OfficialReceiptPrefix = "OR-",
                StudentNumberPrefix = "NAI",
                StudentNumberCounterLength = 6,
                BillNumberPrefix = "BILL-",
                PaymentNumberPrefix = "PAY-",
                Currency = "PHP",
                Address = "Main Campus",
                ContactEmail = "admin@noahsacademy.edu.ph",
                ContactPhone = "+63 2 8000 0000"
            };
            _context.SchoolSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return MapToResponse(settings);
    }

    public async Task<SchoolSettingResponse> UpdateSettingsAsync(UpdateSchoolSettingRequest request)
    {
        var settings = await _context.SchoolSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new SchoolSetting();
            _context.SchoolSettings.Add(settings);
        }

        settings.SchoolName = request.SchoolName;
        settings.SchoolLogoUrl = request.SchoolLogoUrl;
        settings.CurrentAcademicYearId = request.CurrentAcademicYearId;
        settings.OfficialReceiptPrefix = request.OfficialReceiptPrefix;
        settings.StudentNumberPrefix = string.IsNullOrWhiteSpace(request.StudentNumberPrefix) ? "NAI" : request.StudentNumberPrefix;
        settings.StudentNumberCounterLength = request.StudentNumberCounterLength > 0 ? request.StudentNumberCounterLength : 6;
        settings.BillNumberPrefix = request.BillNumberPrefix;
        settings.PaymentNumberPrefix = request.PaymentNumberPrefix;
        settings.Currency = request.Currency;
        settings.Address = request.Address;
        settings.ContactEmail = request.ContactEmail;
        settings.ContactPhone = request.ContactPhone;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponse(settings);
    }

    private static SchoolSettingResponse MapToResponse(SchoolSetting setting)
    {
        return new SchoolSettingResponse
        {
            Id = setting.Id,
            SchoolName = setting.SchoolName,
            SchoolLogoUrl = setting.SchoolLogoUrl,
            CurrentAcademicYearId = setting.CurrentAcademicYearId,
            CurrentAcademicYearName = setting.CurrentAcademicYear?.SchoolYear,
            OfficialReceiptPrefix = setting.OfficialReceiptPrefix,
            StudentNumberPrefix = string.IsNullOrWhiteSpace(setting.StudentNumberPrefix) ? "NAI" : setting.StudentNumberPrefix,
            StudentNumberCounterLength = setting.StudentNumberCounterLength > 0 ? setting.StudentNumberCounterLength : 6,
            BillNumberPrefix = setting.BillNumberPrefix,
            PaymentNumberPrefix = setting.PaymentNumberPrefix,
            Currency = setting.Currency,
            Address = setting.Address,
            ContactEmail = setting.ContactEmail,
            ContactPhone = setting.ContactPhone
        };
    }
}
