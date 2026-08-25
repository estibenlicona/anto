namespace GestionCapacidad.RestClient.Examples;

public interface IOrdersApiClient
{
    Task<OrderDto> GetOrderAsync(string orderId, CancellationToken cancellationToken = default);
}
