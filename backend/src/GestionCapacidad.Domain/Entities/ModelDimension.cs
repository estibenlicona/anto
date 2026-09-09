using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una dimensión del cuestionario dentro de una versión del modelo.
///
/// Hasta ahora las dimensiones eran un conjunto cerrado de siete en el código.
/// Pasan a ser contenido de la versión porque son justamente lo que se
/// recalibra: una versión nueva puede partir una dimensión en dos, o
/// desactivar la que dejó de discriminar. <see cref="Code"/> existe aparte del
/// nombre porque el nombre se edita y las preguntas referencian el código.
///
/// Desactivar no borra: las estimaciones ya calculadas siguen necesitando la
/// dimensión para leerse.
/// </summary>
public sealed class ModelDimension
{
    private ModelDimension()
    {
    }

    public ModelDimension(string code, string name, int order, bool active)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código de la dimensión es obligatorio.");
        }

        if (code.Trim().Length > 20)
        {
            throw new DomainException("El código de la dimensión no puede superar 20 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException($"El nombre de la dimensión {code.Trim()} es obligatorio.");
        }

        if (name.Trim().Length > 100)
        {
            throw new DomainException("El nombre de la dimensión no puede superar 100 caracteres.");
        }

        if (order < 1)
        {
            throw new DomainException($"El orden de la dimensión {code.Trim()} debe ser mayor o igual a 1.");
        }

        Code = code.Trim();
        Name = name.Trim();
        Order = order;
        Active = active;
    }

    /// <summary>El identificador estable al que apuntan las preguntas.</summary>
    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    /// <summary>El orden en que el cuestionario presenta la dimensión.</summary>
    public int Order { get; private set; }

    /// <summary>Una dimensión inactiva sale del cuestionario sin perder sus preguntas.</summary>
    public bool Active { get; private set; }
}
