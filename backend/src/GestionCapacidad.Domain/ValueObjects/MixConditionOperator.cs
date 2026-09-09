namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Cómo se compara el puntaje de un driver contra el umbral de un modificador
/// de mix. Dos operadores alcanzan: un modificador se dispara cuando el driver
/// pasa de cierto nivel, o cuando se queda por debajo de él.
/// </summary>
public enum MixConditionOperator
{
    /// <summary>Se dispara cuando el puntaje del driver alcanza o supera el umbral.</summary>
    Gte,

    /// <summary>Se dispara cuando el puntaje del driver no supera el umbral.</summary>
    Lte,
}
