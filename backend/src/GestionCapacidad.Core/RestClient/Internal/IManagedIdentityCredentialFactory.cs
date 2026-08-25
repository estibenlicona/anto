using Azure.Core;

namespace GestionCapacidad.RestClient.Internal;

internal interface IManagedIdentityCredentialFactory
{
    TokenCredential Create(string? clientId);
}
