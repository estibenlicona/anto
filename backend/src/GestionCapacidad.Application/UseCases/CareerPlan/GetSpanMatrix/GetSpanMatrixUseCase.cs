using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.CareerPlan.GetSpanMatrix;

public sealed record GetSpanMatrixResponse(SpanMatrixDto Span);

/// <summary>La matriz persona × habilidad activa del chapter, con la brecha de cada uno contra su cargo vigente.</summary>
public sealed class GetSpanMatrixUseCase(
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository) : IUseCase<GetSpanMatrixResponse>
{
    public async Task<GetSpanMatrixResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        CareerPlanContext context = await CareerPlanContext.BuildAsync(
            personRepository, skillRepository, assessmentRepository, cancellationToken);

        return new GetSpanMatrixResponse(context.BuildSpan());
    }
}
