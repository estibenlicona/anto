using Microsoft.Extensions.ObjectPool;
using RabbitMQ.Client;
using GestionCapacidad.RabbitMQ.Exceptions;

namespace GestionCapacidad.RabbitMQ.Producer;

public class RabbitModelPooledObjectPolicy : IPooledObjectPolicy<IChannel>
{
    private readonly Uri _urlConnection;
    private IConnection _connection = null!;
    private IChannel _channel = null!;

    public RabbitModelPooledObjectPolicy(Uri urlConnection)
    {
        _urlConnection = urlConnection;
        GetConnection();
    }

    private void GetConnection()
    {
        try
        {
            var factory = new ConnectionFactory() { Uri = _urlConnection };
            _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
            CreateChannel();
        }
        catch (Exception ex)
        {
            throw new ConnectionRabbitException("No es posible conectarse a CloudAmqp, por favor valide la cadena de conexi�n", ex);
        }
    }

    private void CreateChannel()
    {
        try
        {
            _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            throw new ConnectionRabbitException("No es posible establecer el canal, por favor validar los parámetros de canales", ex);
        }
    }

    public IChannel Create()
    {
        if (!_connection.IsOpen)
             GetConnection();

        Return(_channel);

        return _channel;
    }

    public bool Return(IChannel obj)
    {
        ArgumentNullException.ThrowIfNull(obj);

        if (obj.IsOpen)
        {
            return true;
        }
        else
        {
            obj.Dispose(); 
            CreateChannel();
            return false;
        }
    }
}
