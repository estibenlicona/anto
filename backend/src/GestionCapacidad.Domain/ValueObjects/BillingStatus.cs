using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// En qué punto está una prefactura. Nace <see cref="Pending"/> al generarse;
/// registrar el documento la deja <see cref="Received"/>; trabajarla (ajuste,
/// prefacturado, o un segundo documento) la deja <see cref="InReview"/>;
/// <see cref="Approved"/> y <see cref="Objected"/> son los dos cierres, y
/// ninguno de los dos se edita después.
///
/// <c>None</c> no es un valor de este catálogo: es un estado sintético que
/// arma la respuesta cuando una persona externa todavía no tiene registro ese
/// período, y nunca se persiste.
/// </summary>
public sealed record BillingStatus
{
    public static readonly BillingStatus Pending = new("Pending", "Pendiente");

    public static readonly BillingStatus Received = new("Received", "Recibida");

    public static readonly BillingStatus InReview = new("InReview", "En revisión");

    public static readonly BillingStatus Approved = new("Approved", "Aprobada");

    public static readonly BillingStatus Objected = new("Objected", "Objetada");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<BillingStatus> ValidValues =
        [Pending, Received, InReview, Approved, Objected];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private BillingStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static BillingStatus From(string value)
    {
        BillingStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado de la prefactura debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    /// <summary>Aprobar u objetar sólo tiene sentido sobre algo que se está revisando.</summary>
    public bool IsReviewable => this == Received || this == InReview;

    public override string ToString() => Value;
}
