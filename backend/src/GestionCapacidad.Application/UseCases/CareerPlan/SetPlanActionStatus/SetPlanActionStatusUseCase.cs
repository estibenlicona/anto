using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.CareerPlan.SetPlanActionStatus;

public sealed record SetPlanActionStatusCommand(Guid PersonId, Guid ActionId, string Status);

public sealed record SetPlanActionStatusResponse(PersonPlanDto Plan);

/// <summary>
/// Cambia el estado de una acción del plan. Cumplirla no toca la brecha: el
/// nivel evaluado —y por tanto el gap— siempre sale de la evaluación cerrada
/// más reciente, nunca de la acción.
/// </summary>
public sealed class SetPlanActionStatusUseCase(
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository,
    IPlanActionRepository planActionRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetPlanActionStatusCommand, SetPlanActionStatusResponse>
{
    public async Task<SetPlanActionStatusResponse> ExecuteAsync(SetPlanActionStatusCommand request, CancellationToken cancellationToken = default)
    {
        PlanAction? action = await planActionRepository.GetByIdAsync(request.ActionId, cancellationToken);
        if (action is null || action.PersonId != request.PersonId)
        {
            throw new NotFoundException("Acción no encontrada");
        }

        try
        {
            action.SetStatus(PlanActionStatus.From(request.Status));
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        planActionRepository.Update(action);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        Person person = (await personRepository.GetByIdAsync(action.PersonId, cancellationToken))!;
        CareerPlanContext context = await CareerPlanContext.BuildAsync(
            personRepository, skillRepository, assessmentRepository, cancellationToken);
        IReadOnlyList<PlanAction> actions = await planActionRepository.GetByPersonAsync(action.PersonId, cancellationToken);

        return new SetPlanActionStatusResponse(context.BuildPlan(person, actions));
    }
}
