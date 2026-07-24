using EduCore.API.Models;

namespace EduCore.API.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}