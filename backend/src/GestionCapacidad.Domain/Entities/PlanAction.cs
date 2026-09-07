using System.Text.RegularExpressions;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una acción del plan de carrera: nace de una brecha real (nivel de
/// partida por debajo del objetivo) y se compromete a un mes. Es el único
/// dato con estado propio de Competencias — el span y el perfil se derivan
/// del catálogo y de las evaluaciones cerradas, sin persistir nada de eso.
///
/// Marcarla <see cref="PlanActionStatus.Done"/> no cierra la brecha: eso
/// sólo lo hace una evaluación posterior que suba el nivel. El estado de
/// esta acción es independiente de lo que el nivel evaluado diga hoy.
/// </summary>
public sealed partial class PlanAction : AggregateRoot
{
    private PlanAction()
    {
    }

    public PlanAction(Guid personId, Guid skillId, int fromLevel, int targetLevel, string dueMonth, string title)
    {
        if (personId == Guid.Empty)
        {
            throw new DomainException("La persona de la acción es obligatoria");
        }

        if (skillId == Guid.Empty)
        {
            throw new DomainException("La habilidad de la acción es obligatoria");
        }

        if (fromLevel is < Level.Min or > Level.Max)
        {
            throw new DomainException($"El nivel de partida debe estar entre {Level.Min} y {Level.Max}");
        }

        if (targetLevel is < Level.Min or > Level.Max)
        {
            throw new DomainException($"El nivel objetivo debe estar entre {Level.Min} y {Level.Max}");
        }

        if (targetLevel <= fromLevel)
        {
            throw new DomainException("El nivel objetivo tiene que estar por encima del que tiene hoy");
        }

        if (dueMonth is null || !MonthPattern().IsMatch(dueMonth))
        {
            throw new DomainException("El compromiso se expresa como mes, en formato YYYY-MM");
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new DomainException("La acción necesita un título");
        }

        PersonId = personId;
        SkillId = skillId;
        FromLevel = fromLevel;
        TargetLevel = targetLevel;
        DueMonth = dueMonth;
        Title = title.Trim();
        Status = PlanActionStatus.InProgress;
    }

    public Guid PersonId { get; private set; }

    public Guid SkillId { get; private set; }

    public int FromLevel { get; private set; }

    public int TargetLevel { get; private set; }

    public string DueMonth { get; private set; } = string.Empty;

    public string Title { get; private set; } = string.Empty;

    public PlanActionStatus Status { get; private set; } = PlanActionStatus.InProgress;

    public void SetStatus(PlanActionStatus status)
    {
        ArgumentNullException.ThrowIfNull(status);

        Status = status;
        MarkUpdated();
    }

    [GeneratedRegex(@"^\d{4}-\d{2}$")]
    private static partial Regex MonthPattern();
}
