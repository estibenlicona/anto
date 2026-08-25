namespace GestionCapacidad.RabbitMQ.Settings;

public static class ExchangeType
{
    public static string Fanout { get { return "fanout"; } }
    public static string Direct { get { return "direct"; } }
    public static string Topic { get { return "topic"; } }
}
