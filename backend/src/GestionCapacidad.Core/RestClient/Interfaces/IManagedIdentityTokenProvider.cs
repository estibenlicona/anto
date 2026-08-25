using GestionCapacidad.RestClient.Models;

namespace GestionCapacidad.RestClient.Interfaces;

public interface IManagedIdentityTokenProvider
{
    ValueTask<AccessToken> GetTokenAsync(
        string[] scopes,
        string? clientId,
        CancellationToken cancellationToken);
}
