using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Lo propio de una banda de talla: su nombre, el rango de persona-mes que
/// implica y cómo se lee. Su rango de porcentaje no vive acá — sale de los
/// cortes del <see cref="TallaBandSet"/>, para que no haya dos números que
/// puedan discrepar sobre dónde termina una banda y empieza la siguiente.
///
/// Tipo poseído: no tiene identidad fuera del conjunto y la lista se
/// reemplaza en bloque. <see cref="Position"/> conserva el orden con el que
/// se guardó, que es el orden en que se responde.
/// </summary>
public sealed class TallaBand
{
    private TallaBand()
    {
    }

    public TallaBand(int position, string talla, decimal pmMin, decimal pmMax, string lectura)
    {
        if (position < 0)
        {
            throw new DomainException("La posición de la banda no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(talla))
        {
            throw new DomainException("La talla de la banda es obligatoria.");
        }

        if (talla.Trim().Length > 10)
        {
            throw new DomainException("La talla no puede superar 10 caracteres.");
        }

        if (pmMin < 0)
        {
            throw new DomainException($"El persona-mes mínimo de la talla {talla.Trim()} no puede ser negativo.");
        }

        if (pmMin > pmMax)
        {
            throw new DomainException(
                $"El persona-mes mínimo de la talla {talla.Trim()} no puede superar su máximo.");
        }

        if (string.IsNullOrWhiteSpace(lectura))
        {
            throw new DomainException($"La lectura de la talla {talla.Trim()} es obligatoria.");
        }

        if (lectura.Trim().Length > 200)
        {
            throw new DomainException("La lectura no puede superar 200 caracteres.");
        }

        Position = position;
        Talla = talla.Trim();
        PmMin = pmMin;
        PmMax = pmMax;
        Lectura = lectura.Trim();
    }

    public int Position { get; private set; }

    public string Talla { get; private set; } = string.Empty;

    public decimal PmMin { get; private set; }

    public decimal PmMax { get; private set; }

    public string Lectura { get; private set; } = string.Empty;
}
