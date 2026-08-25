using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;

namespace GestionCapacidad.WebApi.Middlewares;

public sealed class IdempotencyMiddleware(RequestDelegate next, IMemoryCache memoryCache)
{
    public const string HeaderName = "Idempotency-Key";

    private static readonly HashSet<string> MethodsRequiringIdempotency = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Post,
        HttpMethods.Put
    };

    public async Task InvokeAsync(HttpContext context)
    {
        if (!MethodsRequiringIdempotency.Contains(context.Request.Method))
        {
            await next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(HeaderName, out StringValues idempotencyKeyValues) ||
            string.IsNullOrWhiteSpace(idempotencyKeyValues.FirstOrDefault()))
        {
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status400BadRequest,
                "Missing idempotency key",
                $"{HeaderName} header is required for POST and PUT requests.",
                context.RequestAborted);
            return;
        }

        var idempotencyKey = idempotencyKeyValues.First()!.Trim();
        var cacheKey = $"{context.Request.Method}:{context.Request.Path}:{idempotencyKey}";

        if (memoryCache.TryGetValue(cacheKey, out _))
        {
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status409Conflict,
                "Duplicated operation",
                "The same idempotency key was already used for this operation.",
                context.RequestAborted);
            return;
        }

        memoryCache.Set(
            cacheKey,
            true,
            new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            });

        await next(context);
    }

    private static async Task WriteProblemDetailsAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        CancellationToken cancellationToken)
    {
        if (context.Response.HasStarted || context.RequestAborted.IsCancellationRequested)
        {
            return;
        }

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: cancellationToken);
    }
}
