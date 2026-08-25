using System.Net;
using System.Net.Http.Headers;
using GestionCapacidad.RestClient.Configurations;
using GestionCapacidad.RestClient.Interfaces;
using GestionCapacidad.RestClient.Models;

namespace GestionCapacidad.RestClient.Handlers;

public sealed class OAuthAuthorizationHandler(
    string clientName,
    AuthOptions options,
    IAccessTokenProvider accessTokenProvider) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        BufferedContent? bufferedContent = await BufferContentAsync(request, cancellationToken).ConfigureAwait(false);

        AccessToken token = await accessTokenProvider.GetTokenAsync(clientName, options, cancellationToken).ConfigureAwait(false);
        request.Headers.Authorization = new AuthenticationHeaderValue(token.TokenType, token.Value);

        HttpResponseMessage response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode != HttpStatusCode.Unauthorized)
        {
            return response;
        }

        response.Dispose();
        await accessTokenProvider.InvalidateAsync(clientName, cancellationToken).ConfigureAwait(false);

        AccessToken refreshedToken = await accessTokenProvider.GetTokenAsync(clientName, options, cancellationToken).ConfigureAwait(false);
        using HttpRequestMessage retryRequest = CloneRequest(request, bufferedContent);
        retryRequest.Headers.Authorization = new AuthenticationHeaderValue(refreshedToken.TokenType, refreshedToken.Value);

        return await base.SendAsync(retryRequest, cancellationToken).ConfigureAwait(false);
    }

    private static async Task<BufferedContent?> BufferContentAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.Content is null)
        {
            return null;
        }

        KeyValuePair<string, string[]>[] headers = request.Content.Headers
            .Select(header => KeyValuePair.Create(header.Key, header.Value.ToArray()))
            .ToArray();
        var contentBytes = await request.Content.ReadAsByteArrayAsync(cancellationToken).ConfigureAwait(false);
        HttpContent originalContent = request.Content;

        request.Content = CreateContent(contentBytes, headers);
        originalContent.Dispose();

        return new BufferedContent(contentBytes, headers);
    }

    private static HttpRequestMessage CloneRequest(HttpRequestMessage request, BufferedContent? bufferedContent)
    {
        var clone = new HttpRequestMessage(request.Method, request.RequestUri)
        {
            Version = request.Version,
            VersionPolicy = request.VersionPolicy
        };

        foreach (KeyValuePair<string, IEnumerable<string>> header in request.Headers)
        {
            clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        foreach (KeyValuePair<string, object?> option in request.Options)
        {
            clone.Options.Set(new HttpRequestOptionsKey<object?>(option.Key), option.Value);
        }

        if (bufferedContent is not null)
        {
            clone.Content = CreateContent(bufferedContent.Bytes, bufferedContent.Headers);
        }

        return clone;
    }

    private static ByteArrayContent CreateContent(byte[] bytes, KeyValuePair<string, string[]>[] headers)
    {
        var content = new ByteArrayContent(bytes);
        foreach (KeyValuePair<string, string[]> header in headers)
        {
            content.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        return content;
    }

    private sealed record BufferedContent(byte[] Bytes, KeyValuePair<string, string[]>[] Headers);
}
