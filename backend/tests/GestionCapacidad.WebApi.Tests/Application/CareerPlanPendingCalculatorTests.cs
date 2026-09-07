using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CareerPlanPendingCalculatorTests
{
    private static readonly DateOnly Today = new(2026, 9, 6);

    private static Skill NewSkill(string name, params (string Position, int Level)[] expectations)
    {
        var skill = new Skill(name, SkillGroup.Technical, "Consultas y modelado relacional.");
        foreach ((string position, int level) in expectations)
        {
            skill.SetExpectation(position, level);
        }

        return skill;
    }

    [Fact]
    public void GapsWithoutPlan_ACompletedActionLeavesTheGapWithoutPlanAgain()
    {
        Guid personId = Guid.NewGuid();
        Guid skillId = Guid.NewGuid();
        var span = new SpanMatrixDto(
            [],
            [new SpanPersonDto(personId, "María", "Backend Dev", true, [new SpanCellDto(skillId, 1, 3, 2m)])]);

        var doneAction = new PlanAction(personId, skillId, 1, 3, "2026-06", "Curso avanzado");
        doneAction.SetStatus(PlanActionStatus.Done);

        SpanPendingDto pending = CareerPlanPendingCalculator.Compute(span, [], [doneAction], Today);

        Assert.Equal(1, pending.GapsWithoutPlan);
    }

    [Fact]
    public void GapsWithoutPlan_AnInProgressActionCountsAsPlanned()
    {
        Guid personId = Guid.NewGuid();
        Guid skillId = Guid.NewGuid();
        var span = new SpanMatrixDto(
            [],
            [new SpanPersonDto(personId, "María", "Backend Dev", true, [new SpanCellDto(skillId, 1, 3, 2m)])]);

        var inProgress = new PlanAction(personId, skillId, 1, 3, "2026-06", "Curso avanzado");

        SpanPendingDto pending = CareerPlanPendingCalculator.Compute(span, [], [inProgress], Today);

        Assert.Equal(0, pending.GapsWithoutPlan);
    }

    [Fact]
    public void OverduePlans_OnlyInProgressActionsWithAPastDueMonthCount()
    {
        var overdue = new PlanAction(Guid.NewGuid(), Guid.NewGuid(), 1, 3, "2026-08", "Vencida");
        var future = new PlanAction(Guid.NewGuid(), Guid.NewGuid(), 1, 3, "2026-12", "A tiempo");
        var doneOverdue = new PlanAction(Guid.NewGuid(), Guid.NewGuid(), 1, 3, "2026-01", "Cumplida vencida");
        doneOverdue.SetStatus(PlanActionStatus.Done);

        SpanPendingDto pending = CareerPlanPendingCalculator.Compute(
            new SpanMatrixDto([], []), [], [overdue, future, doneOverdue], Today);

        Assert.Equal(1, pending.OverduePlans);
    }

    [Fact]
    public void PositionsWithoutLevel_CountsDistinctPositionsMissingAnyActiveSkillLevel()
    {
        // SQL declara nivel para los dos cargos; Azure sólo para Backend Dev.
        // QA Engineer queda sin nivel declarado en Azure → cuenta el pendiente.
        Skill sql = NewSkill("SQL", ("Backend Dev", 3), ("QA Engineer", 2));
        Skill azure = NewSkill("Azure", ("Backend Dev", 2));
        var span = new SpanMatrixDto(
            [],
            [
                new SpanPersonDto(Guid.NewGuid(), "María", "Backend Dev", false, []),
                new SpanPersonDto(Guid.NewGuid(), "Laura", "QA Engineer", false, []),
            ]);

        SpanPendingDto pending = CareerPlanPendingCalculator.Compute(span, [sql, azure], [], Today);

        Assert.Equal(1, pending.PositionsWithoutLevel);
    }
}
