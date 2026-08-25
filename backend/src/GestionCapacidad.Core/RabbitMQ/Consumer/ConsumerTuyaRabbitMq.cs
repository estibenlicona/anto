using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using GestionCapacidad.RabbitMQ.Settings;

namespace GestionCapacidad.RabbitMQ.Consumer;

public class ConsumerTuyaRabbitMq<T>
{
    private readonly RabbitMqSettings _rabbitMqSettings;
    private readonly ServiceProvider _serviceProvider;
    private readonly ILogger<ConsumeQueueHosted<T>> _logger;
    private ConsumeQueueHosted<T>? _consumeQueue;
    private readonly int _channelNumbers;

    public ConsumerTuyaRabbitMq(Uri urlConnection, string queueName, IServiceCollection services, int channelNumbers = 1)
    {
        _channelNumbers = channelNumbers;
        _serviceProvider = services.BuildServiceProvider();
        _rabbitMqSettings = new RabbitMqSettings
        {
            UrlConnection = urlConnection ?? throw new ArgumentNullException(nameof(urlConnection)),
            QueueName = queueName ?? throw new ArgumentNullException(nameof(queueName))
        };
        _logger = _serviceProvider.GetRequiredService<ILoggerFactory>().CreateLogger<ConsumeQueueHosted<T>>();
    }

    public ConsumerTuyaRabbitMq<T> AutoAckCheck(bool autoack)
    {
        _rabbitMqSettings.AutoAck = autoack;
        return this;
    }

    public ConsumeQueueHosted<T> Build()
    {
        _consumeQueue = new ConsumeQueueHosted<T>(_rabbitMqSettings, _serviceProvider, _logger, _channelNumbers);
        return _consumeQueue;
    }

    public void ResetConnection()
    {
        _consumeQueue?.Dispose();
        Build();
    }
}
