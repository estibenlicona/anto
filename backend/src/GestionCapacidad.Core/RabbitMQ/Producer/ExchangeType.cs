namespace GestionCapacidad.RabbitMQ.Producer;

public static class ExchangeType
{
    private static readonly string direct = "direct";
    private static readonly string fanout = "fanout";
    private static readonly string topic = "topic";

    public static string Direct => direct;
    public static string Fanout => fanout;
    public static string Topic => topic;
}
