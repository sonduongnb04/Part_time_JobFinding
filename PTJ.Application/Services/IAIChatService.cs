using PTJ.Application.Common;

namespace PTJ.Application.Services;

public interface IAIChatService
{
    /// <summary>
    /// Process a chat message using AI with function calling capabilities.
    /// </summary>
    /// <param name="userId">The ID of the user sending the message (used for context/permissions).</param>
    /// <param name="userMessage">The raw message text from the user.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The AI's response text.</returns>
    Task<Result<string>> ChatAsync(int userId, string userMessage, CancellationToken cancellationToken = default);
}
