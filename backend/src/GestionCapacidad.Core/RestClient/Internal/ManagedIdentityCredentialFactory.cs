using Azure.Core;
using Azure.Identity;

namespace GestionCapacidad.RestClient.Internal;

internal sealed class ManagedIdentityCredentialFactory : IManagedIdentityCredentialFactory
{
    public TokenCredential Create(string? clientId)
        => string.IsNullOrWhiteSpace(clientId)
            ? new ManagedIdentityCredential(new ManagedIdentityCredentialOptions())
            : new ManagedIdentityCredential(ManagedIdentityId.FromUserAssignedClientId(clientId.Trim()));
}
