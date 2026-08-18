using EduCore.API.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace EduCore.API.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".png", ".jpg", ".jpeg"
    };

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf", "image/png", "image/jpeg", "image/jpg", "image/pjpeg"
    };

    private static readonly HashSet<string> ForbiddenExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".exe", ".bat", ".zip", ".dll", ".js", ".msi", ".sh", ".cmd", ".scr", ".vbs", ".ps1", ".jar", ".sys"
    };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public FileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<(string storedFilename, string storagePath, string contentType, long fileSize)> SaveAdmissionDocumentAsync(
        int applicationId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("Uploaded file is empty or missing.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size ({Math.Round(file.Length / (1024.0 * 1024.0), 2)} MB) exceeds the maximum allowed limit of 10 MB.");
        }

        // Sanitize and check extension
        var originalFileName = Path.GetFileName(file.FileName);
        var extension = Path.GetExtension(originalFileName)?.ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || ForbiddenExtensions.Contains(extension))
        {
            throw new InvalidOperationException($"File type '{extension}' is strictly forbidden.");
        }

        if (!AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type '{extension}' is not allowed. Supported formats: PDF, PNG, JPG, JPEG.");
        }

        // Validate MIME type
        var contentType = file.ContentType?.ToLowerInvariant() ?? "application/octet-stream";
        if (!AllowedMimeTypes.Contains(contentType))
        {
            throw new ArgumentException($"Invalid file content type '{file.ContentType}'. Supported formats: PDF, PNG, JPG, JPEG.");
        }

        // Magic Byte (File Signature) Validation
        using (var reader = new BinaryReader(file.OpenReadStream()))
        {
            var headerBytes = reader.ReadBytes(4);
            if (headerBytes.Length < 4)
            {
                throw new ArgumentException("Uploaded file is corrupted or too small.");
            }

            var isValidSignature = extension switch
            {
                ".pdf" => headerBytes[0] == 0x25 && headerBytes[1] == 0x50 && headerBytes[2] == 0x44 && headerBytes[3] == 0x46, // %PDF
                ".png" => headerBytes[0] == 0x89 && headerBytes[1] == 0x50 && headerBytes[2] == 0x4E && headerBytes[3] == 0x47, // .PNG
                ".jpg" or ".jpeg" => headerBytes[0] == 0xFF && headerBytes[1] == 0xD8 && headerBytes[2] == 0xFF, // JPEG
                _ => false
            };

            if (!isValidSignature)
            {
                throw new ArgumentException($"File content does not match signature for format '{extension}'. Uploaded file may be corrupted or spoofed.");
            }
        }

        // Path Traversal Defense & Target Directory Setup
        var webRootPath = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRootPath))
        {
            webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        var admissionsDir = Path.Combine(webRootPath, "uploads", "admissions", applicationId.ToString());

        if (!Directory.Exists(admissionsDir))
        {
            Directory.CreateDirectory(admissionsDir);
        }

        // Generate GUID Filename
        var guidName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(admissionsDir, guidName);

        // Security check: ensure target path remains inside admissionsDir
        var fullPathNormalized = Path.GetFullPath(fullPath);
        var dirNormalized = Path.GetFullPath(admissionsDir);
        if (!fullPathNormalized.StartsWith(dirNormalized, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Path traversal attempt detected.");
        }

        using (var stream = new FileStream(fullPathNormalized, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream);
        }

        // Relative storage path stored in DB (e.g. uploads/admissions/101/guid.pdf)
        var relativeStoragePath = Path.Combine("uploads", "admissions", applicationId.ToString(), guidName).Replace('\\', '/');

        return (guidName, relativeStoragePath, contentType, file.Length);
    }

    public (Stream fileStream, string contentType, string storedFilename)? GetFileStream(string storagePath)
    {
        if (string.IsNullOrWhiteSpace(storagePath)) return null;

        var webRootPath = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRootPath))
        {
            webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        // Handle both relative and absolute paths cleanly
        var fullPath = Path.IsPathRooted(storagePath)
            ? storagePath
            : Path.Combine(webRootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));

        if (!File.Exists(fullPath)) return null;

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            _ => "application/octet-stream"
        };

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var storedFilename = Path.GetFileName(fullPath);

        return (stream, contentType, storedFilename);
    }

    public bool DeleteFile(string storagePath)
    {
        if (string.IsNullOrWhiteSpace(storagePath)) return false;

        try
        {
            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
            }

            var fullPath = Path.IsPathRooted(storagePath)
                ? storagePath
                : Path.Combine(webRootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
        }
        catch { }

        return false;
    }
}
