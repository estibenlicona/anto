using System.Collections.Concurrent;
using Azure.Core;
using GestionCapacidad.RestClient.Interfaces;
using GestionCapacidad.RestClient.Internal;
using RestClientAccessToken = GestionCapacidad.RestClient.Models.AccessToken;

namespace GestionCapacidad.RestClient.Services;

internal sealed class ManagedIdentityTokenProvider(
    IManagedIdentityCredentialFactory credentialFactory) : IManagedIdentityTokenProvider
{
    private readonly ConcurrentDictionary<string, TokenCredential> _credentials = new(StringComparer.Ordinal);

    public async ValueTask<RestClientAccessToken> GetTokenAsync(
        string[] scopes,
        string? clientId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);

        var cacheKey = NormalizeClientId(clientId);
        TokenCredential credential = _credentials.GetOrAdd(cacheKey, credentialFactory.Create);
        AccessToken token = await credential.GetTokenAsync(
            new TokenRequestContext(scopes),
            cancellationToken).ConfigureAwait(false);

        return new RestClientAccessToken("Bearer", token.Token, token.ExpiresOn);
    }

    private static string NormalizeClientId(string? clientId)
        => string.IsNullOrWhiteSpace(clientId) ? string.Empty : clientId.Trim();
}
