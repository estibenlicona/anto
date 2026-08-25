using Microsoft.AspNetCore.Mvc;
using GestionCapacidad.Domain.Exceptions;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.WebApi.Middlewares;

public sealed class ErrorHandlerMiddleware(
    RequestDelegate next,
    ILogger<ErrorHandlerMiddleware> logger,
    IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OperationCanceledException exception) when (context.RequestAborted.IsCancellationRequested)
        {
            logger.LogInformation(exception, "Request was cancelled by the client.");
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                logger.LogError(
                    exception,
                    "The response has already started. The error handler cannot write ProblemDetails.");
                throw;
            }

            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        (int statusCode, string? title, string? detail) = GetProblemDetails(exception);

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception was converted to ProblemDetails.");
        }
        else
        {
            logger.LogWarning(exception, "Handled exception was converted to ProblemDetails.");
        }

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: context.RequestAborted);
    }

    private (int StatusCode, string Title, string Detail) GetProblemDetails(Exception exception)
    {
        return exception switch
        {
            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Resource not found",
                exception.Message),
            BadRequestException => (
                StatusCodes.Status400BadRequest,
                "Bad request",
                exception.Message),
            DomainValidationException validationException => (
                StatusCodes.Status400BadRequest,
                "Validation error",
                string.Join("; ", validationException.Errors)),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                exception.Message),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal server error",
                environment.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred.")
        };
    }
}
