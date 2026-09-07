using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un stack que la persona domina: nombre del catálogo del chapter, nivel en
/// la escala Tuya (1–4) y si es su stack principal. Tipo poseído por
/// <see cref="Person"/>: no tiene identidad fuera de la persona y la lista se
/// reemplaza en bloque; que el nombre pertenezca al catálogo lo valida el use
/// case, que es quien lo conoce.
/// </summary>
public sealed class PersonStack
{
    private PersonStack()
    {
    }

    public PersonStack(string name, Level level, bool isPrimary)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Stack name is required.");
        }

        if (name.Trim().Length > 100)
        {
            throw new DomainException("Stack name cannot exceed 100 characters.");
        }

        Name = name.Trim();
        Level = level;
        IsPrimary = isPrimary;
    }

    public string Name { get; private set; } = string.Empty;

    public Level Level { get; private set; } = Level.From(Level.Min);

    public bool IsPrimary { get; private set; }
}
