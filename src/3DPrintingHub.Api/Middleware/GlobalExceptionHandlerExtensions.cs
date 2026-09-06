using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application.Exceptions;

namespace _3DPrintingHub.Api.Middleware;

public static class GlobalExceptionHandlerExtensions
{
    public static void UseGlobalExceptionHandler(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
                var (statusCode, title) = MapException(exception);

                if (statusCode >= StatusCodes.Status500InternalServerError)
                {
                    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>()
                        .CreateLogger("GlobalExceptionHandler");
                    logger.LogError(exception, "Unhandled exception while processing {RequestPath}", context.Request.Path);
                }

                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "application/problem+json";

                var problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = title,
                    Detail = exception is DbUpdateConcurrencyException
                        ? "The resource was changed by another request. Please reload it and try again."
                        : statusCode == StatusCodes.Status500InternalServerError
                        ? "The server could not complete the request."
                        : exception?.Message,
                    Instance = context.Request.Path,
                    Type = $"https://httpstatuses.com/{statusCode}"
                };

                problemDetails.Extensions["traceId"] = context.TraceIdentifier;

                await context.Response.WriteAsJsonAsync(problemDetails);
            });
        });
    }

    private static (int StatusCode, string Title) MapException(Exception? exception)
    {
        return exception switch
        {
            ResourceNotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            ResourceConflictException => (StatusCodes.Status409Conflict, "Resource conflict"),
            BusinessRuleException => (StatusCodes.Status422UnprocessableEntity, "Business rule violation"),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "Concurrency conflict"),
            InvalidOperationException legacyException when IsNotFoundMessage(legacyException.Message)
                => (StatusCodes.Status404NotFound, "Resource not found"),
            InvalidOperationException => (StatusCodes.Status409Conflict, "Operation cannot be completed"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };
    }

    private static bool IsNotFoundMessage(string message) =>
        message.Contains("does not exist", StringComparison.OrdinalIgnoreCase) ||
        message.Contains("not found", StringComparison.OrdinalIgnoreCase);
}