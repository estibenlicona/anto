using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una capacidad y cuánta gente suya pide cada talla.
///
/// <see cref="Key"/> existe aparte del nombre porque el nombre es justamente
/// lo que se edita: si la fila se identificara por él, renombrar
/// "QA Engineer" a "QA" sería indistinguible de borrar una fila y crear otra,
/// y sus cantidades se perderían o se confundirían con las de otra.
///
/// Las cantidades se indexan por talla y no como campos fijos xs/s/m: con
/// campos fijos habría dos listas de tallas —la de las bandas y la implícita
/// acá— y nada que obligue a que coincidan.
/// </summary>
public sealed class CapabilityMixRow
{
    private CapabilityMixRow()
    {
    }

    public CapabilityMixRow(int position, string key, string capacidad, IReadOnlyDictionary<string, int> porTalla)
    {
        ArgumentNullException.ThrowIfNull(porTalla);

        if (position < 0)
        {
            throw new DomainException("La posición de la capacidad no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new DomainException("El id de la capacidad es obligatorio.");
        }

        if (key.Trim().Length > 50)
        {
            throw new DomainException("El id de la capacidad no puede superar 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(capacidad))
        {
            throw new DomainException("El nombre de la capacidad es obligatorio.");
        }

        if (capacidad.Trim().Length > 100)
        {
            throw new DomainException("El nombre de la capacidad no puede superar 100 caracteres.");
        }

        foreach ((string talla, int amount) in porTalla)
        {
            if (string.IsNullOrWhiteSpace(talla))
            {
                throw new DomainException($"La capacidad {capacidad.Trim()} tiene una cantidad sin talla.");
            }

            if (amount < 0)
            {
                throw new DomainException(
                    $"La cantidad de {capacidad.Trim()} para la talla {talla} debe ser un entero mayor o igual a 0.");
            }
        }

        Position = position;
        Key = key.Trim();
        Capacidad = capacidad.Trim();
        PorTalla = porTalla.ToDictionary(pair => pair.Key, pair => pair.Value);
    }

    public int Position { get; private set; }

    /// <summary>El <c>id</c> del contrato: estable, independiente del nombre.</summary>
    public string Key { get; private set; } = string.Empty;

    public string Capacidad { get; private set; } = string.Empty;

    /// <summary>Cantidades por talla. Una talla ausente se lee como cero.</summary>
    public IReadOnlyDictionary<string, int> PorTalla { get; private set; } =
        new Dictionary<string, int>();
}
