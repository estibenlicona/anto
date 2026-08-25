namespace GestionCapacidad.RestClient.Interfaces;

public interface IHttpErrorHandler
{
    Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken);
}
