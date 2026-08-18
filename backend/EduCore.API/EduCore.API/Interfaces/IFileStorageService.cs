using Microsoft.AspNetCore.Http;

namespace EduCore.API.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Stores an uploaded document file physically under wwwroot/uploads/admissions/{applicationId}/
    /// using a secure GUID filename. Validates file extension, size, empty files, and MIME type.
    /// </summary>
    Task<(string storedFilename, string storagePath, string contentType, long fileSize)> SaveAdmissionDocumentAsync(
        int applicationId,
        IFormFile file);

    /// <summary>
    /// Retrieves the physical file stream for preview or download if file exists.
    /// </summary>
    (Stream fileStream, string contentType, string storedFilename)? GetFileStream(string storagePath);

    /// <summary>
    /// Deletes a physical file from disk if it exists.
    /// </summary>
    bool DeleteFile(string storagePath);
}
