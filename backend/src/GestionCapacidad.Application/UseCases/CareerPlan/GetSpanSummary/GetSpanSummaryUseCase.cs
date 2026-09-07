using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.CareerPlan.GetSpanSummary;

public sealed record GetSpanSummaryResponse(SpanSummaryDto Summary);

/// <summary>La lectura de situación del chapter: brechas críticas, cobertura, riesgo, tendencia y pendientes.</summary>
public sealed class GetSpanSummaryUseCase(
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository,
    IPlanActionRepository planActionRepository,
    TimeProvider timeProvider) : IUseCase<GetSpanSummaryResponse>
{
    public async Task<GetSpanSummaryResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        CareerPlanContext context = await CareerPlanContext.BuildAsync(
            personRepository, skillRepository, assessmentRepository, cancellationToken);

        SpanMatrixDto span = context.BuildSpan();
        List<SpanCyclePointDto> trend = [.. context.ClosedCycles.Select(cycle => new SpanCyclePointDto(cycle, context.GapsInCycle(cycle)))];

        IReadOnlyList<PlanAction> actions = await planActionRepository.GetAllAsync(cancellationToken);
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        SpanPendingDto pending = CareerPlanPendingCalculator.Compute(span, context.ActiveSkills, actions, today);

        return new GetSpanSummaryResponse(SpanSummaryCalculator.Compute(span, trend, pending));
    }
}
