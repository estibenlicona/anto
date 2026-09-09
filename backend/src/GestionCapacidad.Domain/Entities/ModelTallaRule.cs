using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Lo propio de una talla dentro de una versión: su nombre, los tres
/// parámetros de esfuerzo en persona-mes y cómo se lee. Su rango de porcentaje
/// no vive acá — sale de los cortes de la versión, para que no haya dos números
/// que puedan discrepar sobre dónde termina una talla y empieza la siguiente.
///
/// <see cref="PmExpected"/> es un **parámetro propio** y no el punto medio de
/// <see cref="PmMin"/> y <see cref="PmMax"/>. Con el punto medio, todas las
/// iniciativas de una talla recibían la misma cifra sin importar su puntaje;
/// como parámetro, es el ancla sobre la que el puntaje de esfuerzo interpola.
/// </summary>
public sealed class ModelTallaRule
{
    private ModelTallaRule()
    {
    }

    public ModelTallaRule(
        int position,
        string talla,
        decimal pmMin,
        decimal pmExpected,
        decimal pmMax,
        string lectura,
        string action)
    {
        if (position < 0)
        {
            throw new DomainException("La posición de la talla no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(talla))
        {
            throw new DomainException("El nombre de la talla es obligatorio.");
        }

        if (talla.Trim().Length > 10)
        {
            throw new DomainException("La talla no puede superar 10 caracteres.");
        }

        string name = talla.Trim();

        if (pmMin < 0m)
        {
            throw new DomainException($"El persona-mes mínimo de la talla {name} no puede ser negativo.");
        }

        if (pmMin > pmExpected)
        {
            throw new DomainException(
                $"El persona-mes esperado de la talla {name} no puede quedar por debajo de su mínimo.");
        }

        if (pmExpected > pmMax)
        {
            throw new DomainException(
                $"El persona-mes esperado de la talla {name} no puede superar su máximo.");
        }

        if (string.IsNullOrWhiteSpace(lectura))
        {
            throw new DomainException($"La lectura de la talla {name} es obligatoria.");
        }

        if (lectura.Trim().Length > 200)
        {
            throw new DomainException("La lectura no puede superar 200 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(action))
        {
            throw new DomainException($"La acción recomendada de la talla {name} es obligatoria.");
        }

        if (action.Trim().Length > 100)
        {
            throw new DomainException("La acción recomendada no puede superar 100 caracteres.");
        }

        Position = position;
        Talla = name;
        PmMin = pmMin;
        PmExpected = pmExpected;
        PmMax = pmMax;
        Lectura = lectura.Trim();
        Action = action.Trim();
    }

    public int Position { get; private set; }

    public string Talla { get; private set; } = string.Empty;

    public decimal PmMin { get; private set; }

    /// <summary>El ancla del esfuerzo: un parámetro, no el punto medio del rango.</summary>
    public decimal PmExpected { get; private set; }

    public decimal PmMax { get; private set; }

    public string Lectura { get; private set; } = string.Empty;

    /// <summary>Qué hacer con una iniciativa de esta talla: ejecutar, planificar, partir.</summary>
    public string Action { get; private set; } = string.Empty;
}
