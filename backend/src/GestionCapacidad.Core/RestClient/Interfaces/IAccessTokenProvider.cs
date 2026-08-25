using GestionCapacidad.RestClient.Configurations;
using GestionCapacidad.RestClient.Models;

namespace GestionCapacidad.RestClient.Interfaces;

public interface IAccessTokenProvider
{
    Task<AccessToken> GetTokenAsync(string clientName, AuthOptions options, CancellationToken cancellationToken);
    Task InvalidateAsync(string clientName, CancellationToken cancellationToken);
}
