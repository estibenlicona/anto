using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;
using GestionCapacidad.RabbitMQ.Exceptions;
using GestionCapacidad.RabbitMQ.Interfaces;
using GestionCapacidad.RabbitMQ.Settings;

namespace GestionCapacidad.RabbitMQ.Consumer;

public class ConsumeQueueHosted<T>(
    RabbitMqSettings rabbitMqSettings,
    IServiceProvider serviceProvider,
    ILogger<ConsumeQueueHosted<T>> logger,
    int channelNumbers) : BackgroundService
{
    private readonly ILogger<ConsumeQueueHosted<T>> _logger = logger;
    private readonly RabbitMqSettings _options = rabbitMqSettings ?? throw new ArgumentNullException(nameof(rabbitMqSettings));
    private IConnection? _connection;
    private readonly IServiceProvider _serviceProvider = serviceProvider;
    private readonly int _channelNumbers = channelNumbers < 1 ? 1 : channelNumbers;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await InitRabbitMQ(stoppingToken).ConfigureAwait(false);

        if (string.IsNullOrEmpty(_options.QueueName))
            throw new ArgumentException("Se requiere un nombre para la cola (Queue) para la suscripción.");

        try
        {
            var totalChannels = Math.Max(_channelNumbers, 1);
            for (var i = 0; i < totalChannels; i++)
            {
                IChannel channel = await _connection!.CreateChannelAsync(cancellationToken: stoppingToken).ConfigureAwait(false);
                await channel.BasicQosAsync(0, 1, false, stoppingToken).ConfigureAwait(false);
                var consumer = new AsyncEventingBasicConsumer(channel);

                // Register the event handler as a Task returning method
                consumer.ReceivedAsync += Consumer_Received;

                await channel.BasicConsumeAsync(_options.QueueName, _options.AutoAck, consumer, stoppingToken).ConfigureAwait(false);
            }
        }
        catch (OperationInterruptedException ex) when (ex.Message.Contains("NOT_FOUND - no queue"))
        {
            throw new QueueRabbitNotExistException($"La cola (Queue) {_options.QueueName} no existe o no está creada.", ex);
        }
    }

    private async Task Consumer_Received(object sender, BasicDeliverEventArgs deliveryEventArgs)
    {
        var eventingConsumer = (AsyncEventingBasicConsumer)sender;
        IHandlerConsumer<T>? callBack = _serviceProvider.GetService<IHandlerConsumer<T>>()
                     ?? _serviceProvider.GetService(typeof(IHandlerConsumerException<T>)) as IHandlerConsumer<T>;

        try
        {
            var content = System.Text.Encoding.UTF8.GetString(deliveryEventArgs.Body.ToArray());
            T? message = JsonSerializer.Deserialize<T>(content);
            await callBack!.Consume(message!).ConfigureAwait(false);
            await eventingConsumer.Channel.BasicAckAsync(deliveryEventArgs.DeliveryTag, false).ConfigureAwait(false);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializando el mensaje: {Message}", ex.Message);
            if (callBack is IHandlerConsumerException<T> handlerException)
                handlerException.NotDeserializedConsume(deliveryEventArgs.Body.ToArray(), ex);

            // No reenqueue, ya que no se puede deserializar el mensaje
            await eventingConsumer.Channel.BasicAckAsync(deliveryEventArgs.DeliveryTag, false).ConfigureAwait(false);
        }
        catch (RabbitMQClientException ex)
        {
            _logger.LogError(ex, "Error en RabbitMQ Client");
            // En este caso, si se quiere reintentar el mensaje, requeue = true
            // Pero esto podría producir un loop infinito si el error persiste.
            // Considerar un mecanismo alternativo (DLQ) o conteo de reintentos.
            await eventingConsumer.Channel.BasicNackAsync(deliveryEventArgs.DeliveryTag, false, false).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando el mensaje con {CallbackName}", nameof(callBack));
            // No reenqueue para evitar loop infinito
            await eventingConsumer.Channel.BasicNackAsync(deliveryEventArgs.DeliveryTag, false, false).ConfigureAwait(false);
            await eventingConsumer.Channel.CloseAsync(541, "Error procesando el mensaje").ConfigureAwait(false);
        }
    }

    private async Task InitRabbitMQ(CancellationToken cancellationToken)
    {
        try
        {
            if (_connection == null || !_connection.IsOpen)
            {
                var factory = new ConnectionFactory { Uri = _options.UrlConnection };
                _connection = await factory.CreateConnectionAsync(cancellationToken).ConfigureAwait(false);
            }
        }
        catch (RabbitMQClientException ex)
        {
            throw new ConnectionRabbitException("No es posible conectarse a CloudAmqp, por favor valide la cadena de conexión", ex);
        }
    }

    public override void Dispose()
    {
        if (_connection?.IsOpen == true)
        {
            _connection.CloseAsync().GetAwaiter().GetResult();
            _connection.Dispose();
        }
        GC.SuppressFinalize(this);
        base.Dispose();
    }
}
