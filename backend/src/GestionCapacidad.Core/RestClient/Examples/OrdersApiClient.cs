using GestionCapacidad.RestClient.Interfaces;

namespace GestionCapacidad.RestClient.Examples;

public sealed class OrdersApiClient(IRestClient client) : IOrdersApiClient
{
    public Task<OrderDto> GetOrderAsync(string orderId, CancellationToken cancellationToken = default)
        => client.GetAsync<OrderDto>($"/orders/{orderId}", cancellationToken);
}
