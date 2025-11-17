using Microsoft.AspNetCore.Http;
using PTJ.Application.Common;

namespace PTJ.Application.Services;

public interface IFileStorageService
{
    Task<Result<string>> UploadFileAsync(IFormFile file, string folder, int userId, CancellationToken cancellationToken = default);
    Task<Result> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);
    Task<Result<byte[]>> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default);
}
