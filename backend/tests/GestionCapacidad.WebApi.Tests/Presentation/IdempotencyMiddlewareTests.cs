using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using GestionCapacidad.WebApi.Middlewares;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class IdempotencyMiddlewareTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task InvokeAsync_MissingIdempotencyKey_Returns400ProblemDetails()
    {
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        DefaultHttpContext context = CreateContext(HttpMethods.Post, "/api/v1/companies");
        var middleware = new IdempotencyMiddleware(_ => Task.CompletedTask, memoryCache);

        await middleware.InvokeAsync(context);

        ProblemDetails problemDetails = await ReadProblemDetailsAsync(context);
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);
        Assert.Equal("Missing idempotency key", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_DuplicateIdempotencyKey_Returns409ProblemDetails()
    {
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        DefaultHttpContext context = CreateContext(HttpMethods.Post, "/api/v1/companies");
        context.Request.Headers[IdempotencyMiddleware.HeaderName] = "create-company-1";
        memoryCache.Set("POST:/api/v1/companies:create-company-1", true);
        var middleware = new IdempotencyMiddleware(_ => Task.CompletedTask, memoryCache);

        await middleware.InvokeAsync(context);

        ProblemDetails problemDetails = await ReadProblemDetailsAsync(context);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);
        Assert.Equal("Duplicated operation", problemDetails.Title);
        Assert.True(problemDetails.Extensions.ContainsKey("traceId"));
    }

    [Fact]
    public async Task InvokeAsync_NonPostPutRequests_DoNotRequireIdempotencyKey()
    {
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        DefaultHttpContext context = CreateContext(HttpMethods.Get, "/api/v1/companies");
        var nextWasCalled = false;
        var middleware = new IdempotencyMiddleware(_ =>
        {
            nextWasCalled = true;
            return Task.CompletedTask;
        }, memoryCache);

        await middleware.InvokeAsync(context);

        Assert.True(nextWasCalled);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        Assert.Null(context.Response.ContentType);
        Assert.Equal(0, context.Response.Body.Length);
    }

    private static DefaultHttpContext CreateContext(string method, string path)
    {
        var context = new DefaultHttpContext();
        context.Request.Method = method;
        context.Request.Path = path;
        context.Response.Body = new MemoryStream();

        return context;
    }

    private static async Task<ProblemDetails> ReadProblemDetailsAsync(HttpContext context)
    {
        context.Response.Body.Position = 0;
        ProblemDetails? problemDetails = await JsonSerializer.DeserializeAsync<ProblemDetails>(
            context.Response.Body,
            JsonOptions);

        return problemDetails ?? throw new InvalidOperationException("ProblemDetails response was not created.");
    }
}
