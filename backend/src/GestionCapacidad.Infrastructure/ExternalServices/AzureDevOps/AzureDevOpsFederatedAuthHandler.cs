using System.Net.Http.Headers;
using Azure.Core;
using Azure.Identity;

namespace GestionCapacidad.Infrastructure.ExternalServices.AzureDevOps;

/// <summary>
/// Sólo en producción: la Identidad Federada de Workload que AKS inyecta al
/// pod, resuelta por <see cref="DefaultAzureCredential"/> — sin ningún
/// secreto en configuración. Ver design.md, decisión 9.
/// </summary>
public sealed class AzureDevOpsFederatedAuthHandler(TokenCredential credential, string scope) : DelegatingHandler
{
    private AccessToken? _cachedToken;

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        AccessToken token = await GetTokenAsync(cancellationToken).ConfigureAwait(false);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);
        return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
    }

    private async Task<AccessToken> GetTokenAsync(CancellationToken cancellationToken)
    {
        if (_cachedToken is { } cached && DateTimeOffset.UtcNow < cached.ExpiresOn.AddMinutes(-1))
        {
            return cached;
        }

        AccessToken fresh = await credential
            .GetTokenAsync(new TokenRequestContext([scope]), cancellationToken)
            .ConfigureAwait(false);
        _cachedToken = fresh;
        return fresh;
    }
}
