using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un driver: el nivel intermedio entre lo que se responde y lo que el modelo
/// concluye.
///
/// Sin él, cada pregunta pegaría directo contra el resultado y el modelo sería
/// una suma con nombres bonitos. Con él, varias preguntas alimentan un mismo
/// concepto —volumen, incertidumbre, integración— y ese concepto es el que
/// actúa sobre las salidas, con un peso distinto en cada una.
/// </summary>
public sealed class ModelDriver
{
    private ModelDriver()
    {
    }

    public ModelDriver(string code, string description, IReadOnlyCollection<EstimationOutput> outputs)
    {
        ArgumentNullException.ThrowIfNull(outputs);

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código del driver es obligatorio.");
        }

        if (code.Trim().Length > 20)
        {
            throw new DomainException("El código del driver no puede superar 20 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new DomainException($"La descripción del driver {code.Trim()} es obligatoria.");
        }

        if (description.Trim().Length > 200)
        {
            throw new DomainException("La descripción del driver no puede superar 200 caracteres.");
        }

        if (outputs.Count == 0)
        {
            throw new DomainException(
                $"El driver {code.Trim()} tiene que actuar sobre al menos una salida.");
        }

        if (outputs.Distinct().Count() != outputs.Count)
        {
            throw new DomainException($"El driver {code.Trim()} repite una salida.");
        }

        Code = code.Trim();
        Description = description.Trim();
        Outputs = [.. outputs];
    }

    public string Code { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    /// <summary>Sobre qué salidas actúa: tamaño, esfuerzo, riesgo o mix.</summary>
    public IReadOnlyList<EstimationOutput> Outputs { get; private set; } = [];
}
