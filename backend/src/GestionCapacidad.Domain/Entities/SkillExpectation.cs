using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// El nivel que un cargo exige en una habilidad. Sólo existe para los cargos
/// que tienen algo declarado — el resto se resuelve "sin definir" al
/// responder, cruzando contra los cargos vigentes de las personas.
/// </summary>
public sealed class SkillExpectation
{
    private SkillExpectation()
    {
    }

    public SkillExpectation(string position, int level)
    {
        if (string.IsNullOrWhiteSpace(position))
        {
            throw new DomainException("El cargo es obligatorio");
        }

        Position = position.Trim();
        Level = ValueObjects.Level.From(level);
    }

    public string Position { get; private set; } = string.Empty;

    public Level Level { get; private set; } = ValueObjects.Level.Principiante;
}
