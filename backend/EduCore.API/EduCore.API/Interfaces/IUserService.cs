using EduCore.API.DTOs;

namespace EduCore.API.Interfaces;

public interface IUserService
{
    Task<List<UserResponse>> GetAllAsync();

    Task<UserResponse?> GetByIdAsync(int id);

    Task<UserResponse> CreateAsync(CreateUserRequest request);

    Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request);

    Task<bool> ToggleStatusAsync(int id);

    Task<bool> DeleteAsync(int id);
}