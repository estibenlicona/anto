using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un nivel de riesgo con su techo de porcentaje. Vive en la versión y no en el
/// código porque el cliente no puede definir el modelo: si los cortes de riesgo
/// estuvieran cableados en la pantalla, publicar una versión con otra escala no
/// cambiaría lo que el usuario lee.
/// </summary>
public sealed class ModelRiskBand
{
    private ModelRiskBand()
    {
    }

    public ModelRiskBand(int position, string level, decimal maxPct)
    {
        if (position < 0)
        {
            throw new DomainException("La posición de la banda de riesgo no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(level))
        {
            throw new DomainException("El nombre del nivel de riesgo es obligatorio.");
        }

        if (level.Trim().Length > 30)
        {
            throw new DomainException("El nombre del nivel de riesgo no puede superar 30 caracteres.");
        }

        if (maxPct is < 0m or > 100m)
        {
            throw new DomainException(
                $"El techo del nivel de riesgo {level.Trim()} debe estar entre 0 y 100. Recibido: {maxPct}.");
        }

        Position = position;
        Level = level.Trim();
        MaxPct = maxPct;
    }

    public int Position { get; private set; }

    public string Level { get; private set; } = string.Empty;

    public decimal MaxPct { get; private set; }
}
