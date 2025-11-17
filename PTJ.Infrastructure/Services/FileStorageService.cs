using Microsoft.AspNetCore.Http;
using PTJ.Application.Common;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _uploadPath;

    public LocalFileStorageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<Result<string>> UploadFileAsync(IFormFile file, string folder, int userId, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return Result<string>.FailureResult("No file provided");
        }

        // Validate file size (max 10MB)
        const long maxFileSize = 10 * 1024 * 1024;
        if (file.Length > maxFileSize)
        {
            return Result<string>.FailureResult("File size exceeds 10MB limit");
        }

        // Validate file extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
        {
            return Result<string>.FailureResult($"File type {fileExtension} is not allowed");
        }

        try
        {
            // Create folder path
            var folderPath = Path.Combine(_uploadPath, folder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            // Create file URL
            var fileUrl = $"/uploads/{folder}/{uniqueFileName}";

            // Save file metadata to database
            var fileEntity = new FileEntity
            {
                FileName = file.FileName,
                FileUrl = fileUrl,
                FileType = folder,
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Files.AddAsync(fileEntity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<string>.SuccessResult(fileUrl, "File uploaded successfully");
        }
        catch (Exception ex)
        {
            return Result<string>.FailureResult($"File upload failed: {ex.Message}");
        }
    }

    public async Task<Result> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            // Find file in database
            var fileEntity = await _unitOfWork.Files.FirstOrDefaultAsync(
                f => f.FileUrl == fileUrl,
                cancellationToken);

            if (fileEntity == null)
            {
                return Result.FailureResult("File not found in database");
            }

            // Delete physical file
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), fileUrl.TrimStart('/'));

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Delete from database
            _unitOfWork.Files.Remove(fileEntity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.SuccessResult("File deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.FailureResult($"File deletion failed: {ex.Message}");
        }
    }

    public async Task<Result<byte[]>> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if file exists in database
            var fileEntity = await _unitOfWork.Files.FirstOrDefaultAsync(
                f => f.FileUrl == fileUrl,
                cancellationToken);

            if (fileEntity == null)
            {
                return Result<byte[]>.FailureResult("File not found");
            }

            // Read file
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), fileUrl.TrimStart('/'));

            if (!File.Exists(filePath))
            {
                return Result<byte[]>.FailureResult("Physical file not found");
            }

            var fileBytes = await File.ReadAllBytesAsync(filePath, cancellationToken);

            return Result<byte[]>.SuccessResult(fileBytes);
        }
        catch (Exception ex)
        {
            return Result<byte[]>.FailureResult($"File download failed: {ex.Message}");
        }
    }
}
