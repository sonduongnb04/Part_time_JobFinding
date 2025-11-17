using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FilesController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Upload a file (avatar, resume, certificate, logo)
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] FileUploadRequest request, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var result = await _fileStorageService.UploadFileAsync(request.File, request.Folder ?? "general", userId, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = null!;
        public string? Folder { get; set; } = "general";
    }

    /// <summary>
    /// Delete a file
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string fileUrl, CancellationToken cancellationToken)
    {
        var result = await _fileStorageService.DeleteFileAsync(fileUrl, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Download a file
    /// </summary>
    [AllowAnonymous]
    [HttpGet("download")]
    public async Task<IActionResult> Download([FromQuery] string fileUrl, CancellationToken cancellationToken)
    {
        var result = await _fileStorageService.DownloadFileAsync(fileUrl, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        // Determine content type based on file extension
        var extension = Path.GetExtension(fileUrl).ToLower();
        var contentType = extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };

        var fileName = Path.GetFileName(fileUrl);
        return File(result.Data!, contentType, fileName);
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }
}
