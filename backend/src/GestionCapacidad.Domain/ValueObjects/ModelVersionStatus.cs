using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// En qué punto de su vida está una versión del modelo. El estado no es una
/// etiqueta: es lo que decide si la versión se puede editar. Sólo un
/// <see cref="Borrador"/> acepta cambios; una <see cref="Vigente"/> o
/// <see cref="Archivada"/> ya calculó estimaciones que alguien usó para
/// decidir, y reescribirla cambiaría el pasado.
/// </summary>
public sealed record ModelVersionStatus
{
    /// <summary>Se edita. Todavía no calculó nada.</summary>
    public static readonly ModelVersionStatus Borrador = new("Borrador");

    /// <summary>La que usan las estimaciones nuevas. Hay a lo sumo una por modelo.</summary>
    public static readonly ModelVersionStatus Vigente = new("Vigente");

    /// <summary>Rigió y ya no rige. Sus estimaciones se siguen leyendo contra ella.</summary>
    public static readonly ModelVersionStatus Archivada = new("Archivada");

    public static readonly IReadOnlyCollection<ModelVersionStatus> ValidValues =
        [Borrador, Vigente, Archivada];

    public string Value { get; }

    private ModelVersionStatus(string value) => Value = value;

    public bool IsDraft => this == Borrador;

    public bool IsCurrent => this == Vigente;

    public static ModelVersionStatus From(string value)
    {
        ModelVersionStatus? match = ValidValues.FirstOrDefault(v =>
            string.Equals(v.Value, value, StringComparison.OrdinalIgnoreCase));

        return match ?? throw new DomainException(
            $"El estado de una versión debe ser uno de: {string.Join(", ", ValidValues.Select(v => v.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
