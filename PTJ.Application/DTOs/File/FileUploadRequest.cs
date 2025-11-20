using Microsoft.AspNetCore.Http;

namespace PTJ.Application.DTOs.File;

public class FileUploadRequest
{
    public IFormFile File { get; set; } = null!;
    public string? Folder { get; set; } = "general";
}
