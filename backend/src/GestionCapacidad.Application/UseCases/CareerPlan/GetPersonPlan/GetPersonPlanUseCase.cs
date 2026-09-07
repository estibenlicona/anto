using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.CareerPlan.GetPersonPlan;

public sealed record GetPersonPlanRequest(Guid PersonId);

public sealed record GetPersonPlanResponse(PersonPlanDto Plan);

/// <summary>El plan de carrera de una persona: su perfil evaluado y las acciones que tiene en curso.</summary>
public sealed class GetPersonPlanUseCase(
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository,
    IPlanActionRepository planActionRepository) : IUseCase<GetPersonPlanRequest, GetPersonPlanResponse>
{
    public async Task<GetPersonPlanResponse> ExecuteAsync(GetPersonPlanRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        CareerPlanContext context = await CareerPlanContext.BuildAsync(
            personRepository, skillRepository, assessmentRepository, cancellationToken);

        IReadOnlyList<PlanAction> actions = await planActionRepository.GetByPersonAsync(person.Id, cancellationToken);

        return new GetPersonPlanResponse(context.BuildPlan(person, actions));
    }
}
