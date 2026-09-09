using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una capacidad y qué porcentaje del esfuerzo de la iniciativa le corresponde
/// en cada talla.
///
/// Antes esto eran personas por talla. El porcentaje es lo correcto porque el
/// mix describe **demanda de perfiles**, no asignación de personas: dos
/// iniciativas de la misma talla con distinto esfuerzo piden la misma
/// composición y distinta cantidad de gente, y con enteros de personas eso no
/// se podía expresar. Los porcentajes de una talla suman 100 — lo verifica la
/// versión, que es quien ve todas las filas a la vez.
///
/// <see cref="Key"/> existe aparte del nombre porque el nombre es justamente lo
/// que se edita: si la fila se identificara por él, renombrar "QA Engineer" a
/// "QA" sería indistinguible de borrar una fila y crear otra.
/// </summary>
public sealed class ModelMixRow
{
    private ModelMixRow()
    {
    }

    public ModelMixRow(int position, string key, string capacidad, IReadOnlyDictionary<string, decimal> porTalla)
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

        foreach ((string talla, decimal percentage) in porTalla)
        {
            if (string.IsNullOrWhiteSpace(talla))
            {
                throw new DomainException($"La capacidad {capacidad.Trim()} tiene un porcentaje sin talla.");
            }

            if (percentage is < 0m or > 100m)
            {
                throw new DomainException(
                    $"El porcentaje de {capacidad.Trim()} para la talla {talla} debe estar entre 0 y 100. Recibido: {percentage}.");
            }
        }

        Position = position;
        Key = key.Trim();
        Capacidad = capacidad.Trim();
        PorTalla = porTalla.ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.Ordinal);
    }

    public int Position { get; private set; }

    /// <summary>El <c>id</c> del contrato: estable, independiente del nombre.</summary>
    public string Key { get; private set; } = string.Empty;

    public string Capacidad { get; private set; } = string.Empty;

    /// <summary>Porcentajes por talla. Una talla ausente se lee como cero.</summary>
    public IReadOnlyDictionary<string, decimal> PorTalla { get; private set; } =
        new Dictionary<string, decimal>(StringComparer.Ordinal);

    public decimal For(string talla) => PorTalla.GetValueOrDefault(talla, 0m);
}
