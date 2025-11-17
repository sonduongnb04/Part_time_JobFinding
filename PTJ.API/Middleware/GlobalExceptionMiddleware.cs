using System.Net;
using System.Text.Json;
using PTJ.Application.Common;

namespace PTJ.API.Middleware;

/// <summary>
/// Middleware for global exception handling
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var response = new Result<object>();

        switch (exception)
        {
            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = Result<object>.FailureResult("Unauthorized access");
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = Result<object>.FailureResult("Resource not found");
                break;

            case ArgumentException:
            case InvalidOperationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = Result<object>.FailureResult(exception.Message);
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = _environment.IsDevelopment()
                    ? Result<object>.FailureResult($"Internal server error: {exception.Message}\n{exception.StackTrace}")
                    : Result<object>.FailureResult("An error occurred while processing your request");
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
