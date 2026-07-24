using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AcademicProgramService : IAcademicProgramService
{
    private readonly EduCoreDbContext _context;

    public AcademicProgramService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<AcademicProgramResponse>> GetAllAsync()
    {
        return await _context.Programs
            .OrderBy(x => x.Code)
            .Select(x => new AcademicProgramResponse
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    public async Task<AcademicProgramResponse?> GetByIdAsync(int id)
    {
        var program = await _context.Programs.FindAsync(id);
        if (program == null) return null;

        return new AcademicProgramResponse
        {
            Id = program.Id,
            Code = program.Code,
            Name = program.Name,
            IsActive = program.IsActive
        };
    }

    public async Task<AcademicProgramResponse> CreateAsync(CreateAcademicProgramRequest request)
    {
        var program = new AcademicProgram
        {
            Code = request.Code,
            Name = request.Name,
            IsActive = request.IsActive
        };

        _context.Programs.Add(program);
        await _context.SaveChangesAsync();

        return new AcademicProgramResponse
        {
            Id = program.Id,
            Code = program.Code,
            Name = program.Name,
            IsActive = program.IsActive
        };
    }

    public async Task<AcademicProgramResponse?> UpdateAsync(int id, UpdateAcademicProgramRequest request)
    {
        var program = await _context.Programs.FindAsync(id);
        if (program == null) return null;

        program.Code = request.Code;
        program.Name = request.Name;
        program.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return new AcademicProgramResponse
        {
            Id = program.Id,
            Code = program.Code,
            Name = program.Name,
            IsActive = program.IsActive
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var program = await _context.Programs.FindAsync(id);
        if (program == null) return false;

        _context.Programs.Remove(program);
        await _context.SaveChangesAsync();
        return true;
    }
}
