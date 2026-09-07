using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Una de las siete dimensiones del modelo de scoring de iniciativas. Es el
/// eje estructural del modelo, no un dato editable: las preguntas se crean,
/// se reformulan y se borran, pero se asignan siempre a una de estas siete.
/// El nombre viaja en español porque es el que se lee en pantalla y el que
/// el contrato transporta (no hay slug aparte).
/// </summary>
public sealed record QuestionDimension
{
    public static readonly QuestionDimension NegocioYCliente = new("Negocio y cliente");

    public static readonly QuestionDimension AlcanceFuncional = new("Alcance funcional");

    public static readonly QuestionDimension Integraciones = new("Integraciones");

    public static readonly QuestionDimension DatosSeguridadYCumplimiento = new("Datos, seguridad y cumplimiento");

    public static readonly QuestionDimension TecnologiaYArquitectura = new("Tecnología y arquitectura");

    public static readonly QuestionDimension OperacionYSoporte = new("Operación y soporte");

    public static readonly QuestionDimension IncertidumbreYDependencias = new("Incertidumbre y dependencias");

    /// <summary>Las siete dimensiones en el orden de referencia del modelo.</summary>
    public static readonly IReadOnlyCollection<QuestionDimension> ValidValues =
    [
        NegocioYCliente,
        AlcanceFuncional,
        Integraciones,
        DatosSeguridadYCumplimiento,
        TecnologiaYArquitectura,
        OperacionYSoporte,
        IncertidumbreYDependencias,
    ];

    /// <summary>El nombre de la dimensión, tal como viaja en el contrato.</summary>
    public string Value { get; }

    private QuestionDimension(string value) => Value = value;

    /// <summary>
    /// Coincidencia exacta, como el mock: una dimensión escrita distinto es
    /// una dimensión que no existe, no una variante de la misma.
    /// </summary>
    public static QuestionDimension From(string value)
    {
        QuestionDimension? match = ValidValues.FirstOrDefault(d =>
            string.Equals(d.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La dimensión debe ser una de: {string.Join(" | ", ValidValues.Select(d => d.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
