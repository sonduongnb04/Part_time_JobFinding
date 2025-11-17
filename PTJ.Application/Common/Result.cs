namespace PTJ.Application.Common;

public class Result
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result SuccessResult(string? message = null)
        => new() { Success = true, Message = message };

    public static Result FailureResult(string message)
        => new() { Success = false, Message = message };

    public static Result FailureResult(List<string> errors)
        => new() { Success = false, Errors = errors };
}

public class Result<T> : Result
{
    public T? Data { get; set; }

    public static Result<T> SuccessResult(T data, string? message = null)
        => new() { Success = true, Data = data, Message = message };

    public new static Result<T> FailureResult(string message)
        => new() { Success = false, Message = message };

    public new static Result<T> FailureResult(List<string> errors)
        => new() { Success = false, Errors = errors };
}
