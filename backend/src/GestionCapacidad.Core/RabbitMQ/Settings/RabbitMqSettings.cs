namespace GestionCapacidad.RabbitMQ.Settings;

public class RabbitMqSettings
{
    public required Uri UrlConnection { get; set; }
    public required string QueueName { get; set; }
    public bool AutoAck { get; set; }
}
