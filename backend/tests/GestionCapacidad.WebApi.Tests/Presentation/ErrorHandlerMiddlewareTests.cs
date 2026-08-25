using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.WebApi.Middlewares;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class ErrorHandlerMiddlewareTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task InvokeAsync_ConvertsNotFoundExceptionInto404()
    {
        ProblemDetails problemDetails = await ExecuteMiddlewareAsync(new NotFoundException("Company was not found."));

        Assert.Equal(StatusCodes.Status404NotFound, problemDetails.Status);
        Assert.Equal("Resource not found", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_ConvertsBadRequestExceptionInto400()
    {
        ProblemDetails problemDetails = await ExecuteMiddlewareAsync(new BadRequestException("Duplicated company."));

        Assert.Equal(StatusCodes.Status400BadRequest, problemDetails.Status);
        Assert.Equal("Bad request", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_ConvertsValidationExceptionInto400()
    {
        ProblemDetails problemDetails = await ExecuteMiddlewareAsync(
            new ValidationException(["Name is required."]));

        Assert.Equal(StatusCodes.Status400BadRequest, problemDetails.Status);
        Assert.Equal("Validation error", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_ConvertsExceptionInto500()
    {
        ProblemDetails problemDetails = await ExecuteMiddlewareAsync(new InvalidOperationException("Unexpected failure."));

        Assert.Equal(StatusCodes.Status500InternalServerError, problemDetails.Status);
        Assert.Equal("Internal server error", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_OperationCanceledExceptionWithRequestAborted_DoesNotWriteProblemDetails()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        using var cancellationTokenSource = new CancellationTokenSource();
        await cancellationTokenSource.CancelAsync();
        context.RequestAborted = cancellationTokenSource.Token;

        Task next(HttpContext _) => throw new OperationCanceledException(cancellationTokenSource.Token);
        ErrorHandlerMiddleware middleware = CreateMiddleware(next);

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        Assert.Null(context.Response.ContentType);
        Assert.Equal(0, context.Response.Body.Length);
    }

    [Fact]
    public async Task InvokeAsync_TaskCanceledExceptionWithRequestAborted_DoesNotWriteProblemDetails()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        using var cancellationTokenSource = new CancellationTokenSource();
        await cancellationTokenSource.CancelAsync();
        context.RequestAborted = cancellationTokenSource.Token;

        static Task next(HttpContext _) => throw new TaskCanceledException("Request cancelled.");
        ErrorHandlerMiddleware middleware = CreateMiddleware(next);

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        Assert.Null(context.Response.ContentType);
        Assert.Equal(0, context.Response.Body.Length);
    }

    [Fact]
    public async Task InvokeAsync_ResponseAlreadyStarted_RethrowsAndDoesNotOverwriteResponse()
    {
        var context = new DefaultHttpContext();
        var responseFeature = new StartedResponseFeature();
        responseFeature.Headers.ContentType = "text/plain";
        responseFeature.StatusCode = StatusCodes.Status202Accepted;
        context.Features.Set<IHttpResponseFeature>(responseFeature);
        static Task next(HttpContext _) => throw new InvalidOperationException("Failure after response started.");
        ErrorHandlerMiddleware middleware = CreateMiddleware(next);

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => middleware.InvokeAsync(context));

        Assert.Equal("Failure after response started.", exception.Message);
        Assert.Equal(StatusCodes.Status202Accepted, context.Response.StatusCode);
        Assert.Equal("text/plain", context.Response.ContentType);
    }

    private static async Task<ProblemDetails> ExecuteMiddlewareAsync(Exception exception)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/companies";
        context.Response.Body = new MemoryStream();

        Task next(HttpContext _) => throw exception;
        ErrorHandlerMiddleware middleware = CreateMiddleware(next);

        await middleware.InvokeAsync(context);

        context.Response.Body.Position = 0;
        ProblemDetails? problemDetails = await JsonSerializer.DeserializeAsync<ProblemDetails>(
            context.Response.Body,
            JsonOptions);

        return problemDetails ?? throw new InvalidOperationException("ProblemDetails response was not created.");
    }

    private static ErrorHandlerMiddleware CreateMiddleware(RequestDelegate next)
    {
        var environment = new Mock<IHostEnvironment>();
        environment
            .SetupGet(hostEnvironment => hostEnvironment.EnvironmentName)
            .Returns(Environments.Production);

        return new ErrorHandlerMiddleware(
            next,
            NullLogger<ErrorHandlerMiddleware>.Instance,
            environment.Object);
    }

    private sealed class StartedResponseFeature : IHttpResponseFeature
    {
        public int StatusCode { get; set; }

        public string? ReasonPhrase { get; set; }

        public IHeaderDictionary Headers { get; set; } = new HeaderDictionary();

        public Stream Body { get; set; } = new MemoryStream();

        public bool HasStarted => true;

        public void OnCompleted(Func<object, Task> callback, object state)
        {
        }

        public void OnStarting(Func<object, Task> callback, object state)
        {
        }
    }
}
