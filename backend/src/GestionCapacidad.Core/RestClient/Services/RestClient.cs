using System.Diagnostics;
using System.Text;
using System.Net;
using Microsoft.Extensions.Logging;
using GestionCapacidad.RestClient.Interfaces;

namespace GestionCapacidad.RestClient.Services;

public sealed class RestClient(
    HttpClient httpClient,
    IRestClientSerializer serializer,
    IHttpErrorHandler errorHandler,
    ILogger<RestClient> logger) : IRestClient
{
    private readonly HttpClient _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    private readonly IRestClientSerializer _serializer = serializer ?? throw new ArgumentNullException(nameof(serializer));
    private readonly IHttpErrorHandler _errorHandler = errorHandler ?? throw new ArgumentNullException(nameof(errorHandler));
    private readonly ILogger<RestClient> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString("N")[..8];

        try
        {
            LogRequest(requestId, request);

            HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
            
            stopwatch.Stop();
            LogResponse(requestId, request, response, stopwatch.ElapsedMilliseconds);

            await _errorHandler.EnsureSuccessAsync(response, cancellationToken).ConfigureAwait(false);
            return response;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            stopwatch.Stop();
            LogRequestError(requestId, request, ex, stopwatch.ElapsedMilliseconds);
            throw new InvalidOperationException($"Error executing HTTP {request.Method} {request.RequestUri}", ex);
        }
    }

    public async Task<TResponse> GetAsync<TResponse>(string path, CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response = await GetAsync(path, cancellationToken).ConfigureAwait(false);
        return await DeserializeResponseAsync<TResponse>(response, cancellationToken).ConfigureAwait(false);
    }

    public Task<HttpResponseMessage> GetAsync(string path, CancellationToken cancellationToken = default)
        => SendAsync(new HttpRequestMessage(HttpMethod.Get, path), cancellationToken);

    public async Task<TResponse> PostAsync<TResponse>(string path, object payload, CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response = await PostAsync(path, payload, cancellationToken).ConfigureAwait(false);
        return await DeserializeResponseAsync<TResponse>(response, cancellationToken).ConfigureAwait(false);
    }

    public Task<HttpResponseMessage> PostAsync(string path, object payload, CancellationToken cancellationToken = default)
    {
        LogPayload(HttpMethod.Post, path, payload);
        return SendAsync(CreateJsonRequest(HttpMethod.Post, path, payload), cancellationToken);
    }

    public async Task<TResponse> PutAsync<TResponse>(string path, object payload, CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response = await PutAsync(path, payload, cancellationToken).ConfigureAwait(false);
        return await DeserializeResponseAsync<TResponse>(response, cancellationToken).ConfigureAwait(false);
    }

    public Task<HttpResponseMessage> PutAsync(string path, object payload, CancellationToken cancellationToken = default)
    {
        LogPayload(HttpMethod.Put, path, payload);
        return SendAsync(CreateJsonRequest(HttpMethod.Put, path, payload), cancellationToken);
    }

    public async Task DeleteAsync(string path, CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response = await DeleteRawAsync(path, cancellationToken).ConfigureAwait(false);
    }

    public Task<HttpResponseMessage> DeleteRawAsync(string path, CancellationToken cancellationToken = default)
        => SendAsync(new HttpRequestMessage(HttpMethod.Delete, path), cancellationToken);

    private HttpRequestMessage CreateJsonRequest(HttpMethod method, string path, object payload)
    {
        var content = _serializer.Serialize(payload);
        return new HttpRequestMessage(method, path)
        {
            Content = new StringContent(content, Encoding.UTF8, "application/json")
        };
    }

    private async Task<TResponse> DeserializeResponseAsync<TResponse>(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.StatusCode == HttpStatusCode.NoContent)
        {
            ThrowEmptyTypedResponse(response);
        }

        var content = response.Content is null
            ? string.Empty
            : await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(content))
        {
            ThrowEmptyTypedResponse(response);
        }

        return _serializer.Deserialize<TResponse>(content);
    }

    private static void ThrowEmptyTypedResponse(HttpResponseMessage response)
    {
        HttpRequestMessage? request = response.RequestMessage;
        throw new InvalidOperationException(
            $"HTTP request {request?.Method.Method ?? "UNKNOWN"} {request?.RequestUri?.ToString() ?? "unknown"} succeeded with status code {(int)response.StatusCode}, but the response body was empty. Typed methods require a JSON response body. No-content endpoints should use SendAsync, raw methods, DeleteAsync, or a dedicated no-content method.");
    }

    private void LogRequest(string requestId, HttpRequestMessage request)
    {
        if (!_logger.IsEnabled(LogLevel.Debug))
        {
            return;
        }

        var headers = request.Headers.ToString().Replace("\r\n", ", ").Trim();
        _logger.LogDebug(
            "[{RequestId}] HTTP Request: {Method} {Uri} | Headers: {Headers}",
            requestId,
            request.Method,
            request.RequestUri,
            string.IsNullOrWhiteSpace(headers) ? "(none)" : headers);
    }

    private void LogResponse(string requestId, HttpRequestMessage request, HttpResponseMessage response, long elapsedMs)
    {
        var logLevel = response.IsSuccessStatusCode ? LogLevel.Information : LogLevel.Warning;

        _logger.Log(
            logLevel,
            "[{RequestId}] HTTP Response: {Method} {Uri} => {StatusCode} ({ReasonPhrase}) in {ElapsedMs}ms",
            requestId,
            request.Method,
            request.RequestUri,
            (int)response.StatusCode,
            response.ReasonPhrase ?? "No reason",
            elapsedMs);
    }

    private void LogRequestError(string requestId, HttpRequestMessage request, Exception exception, long elapsedMs)
    {
        _logger.LogError(
            exception,
            "[{RequestId}] HTTP Request Failed: {Method} {Uri} after {ElapsedMs}ms | Error: {ErrorMessage}",
            requestId,
            request.Method,
            request.RequestUri,
            elapsedMs,
            exception.Message);
    }

    private void LogPayload(HttpMethod method, string path, object payload)
    {
        if (!_logger.IsEnabled(LogLevel.Debug))
        {
            return;
        }

        try
        {
            var serializedPayload = _serializer.Serialize(payload);
            var truncatedPayload = serializedPayload.Length > 1000 
                ? string.Concat(serializedPayload.AsSpan(0, 1000), "...(truncated)") 
                : serializedPayload;

            _logger.LogDebug(
                "HTTP {Method} {Path} | Payload: {Payload}",
                method,
                path,
                truncatedPayload);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to serialize payload for logging");
        }
    }
}
