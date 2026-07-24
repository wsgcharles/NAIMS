using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface ISystemSettingsService
{
    Task<SchoolSettingResponse> GetSettingsAsync();
    Task<SchoolSettingResponse> UpdateSettingsAsync(UpdateSchoolSettingRequest request);
}
