using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Cómo participa la persona en la aplicación. Catálogo cerrado a propósito:
/// mientras el rol fue texto libre se llenó con el cargo, y con los dos campos
/// diciendo lo mismo el sistema no podía responder quién es líder técnico.
/// <c>Contributor</c> es el de quien participa sin liderar. El valor viaja en
/// inglés (slug del contrato) y se muestra en español.
/// </summary>
public sealed record PersonRole
{
    public static readonly PersonRole Administrator = new("Administrator", "Administrador");

    public static readonly PersonRole TechnicalLead = new("TechnicalLead", "Líder Técnico");

    public static readonly PersonRole ExpertiseLead = new("ExpertiseLead", "Líder de Expertise");

    public static readonly PersonRole ProductOwner = new("ProductOwner", "Product Owner");

    public static readonly PersonRole Contributor = new("Contributor", "Colaborador");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<PersonRole> ValidValues =
        [Administrator, TechnicalLead, ExpertiseLead, ProductOwner, Contributor];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private PersonRole(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static PersonRole From(string value)
    {
        PersonRole? match = ValidValues.FirstOrDefault(r =>
            string.Equals(r.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El rol debe ser uno de: {string.Join(", ", ValidValues.Select(r => r.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
