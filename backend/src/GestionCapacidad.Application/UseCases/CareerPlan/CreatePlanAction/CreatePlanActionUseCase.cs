using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.CareerPlan.CreatePlanAction;

public sealed record CreatePlanActionCommand(Guid PersonId, Guid SkillId, int TargetLevel, string DueMonth, string Title);

public sealed record CreatePlanActionResponse(PersonPlanDto Plan);

/// <summary>Registra una acción del plan de carrera: sólo nace de una brecha real ya calculada.</summary>
public sealed class CreatePlanActionUseCase(
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository,
    IPlanActionRepository planActionRepository,
    IUnitOfWork unitOfWork) : IUseCase<CreatePlanActionCommand, CreatePlanActionResponse>
{
    public async Task<CreatePlanActionResponse> ExecuteAsync(CreatePlanActionCommand request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        CareerPlanContext context = await CareerPlanContext.BuildAsync(
            personRepository, skillRepository, assessmentRepository, cancellationToken);
        IReadOnlyList<PlanAction> existingActions = await planActionRepository.GetByPersonAsync(person.Id, cancellationToken);
        PersonPlanDto plan = context.BuildPlan(person, existingActions);

        PlanSkillDto? skill = plan.Skills.FirstOrDefault(s => s.SkillId == request.SkillId);
        if (skill is null)
        {
            throw new BadRequestException("La acción tiene que nacer de una habilidad evaluada de esta persona");
        }

        if (skill.Gap is null || skill.Gap == 0m)
        {
            throw new BadRequestException(
                $"No hay brecha registrada en {skill.SkillName}: una acción del plan existe para cerrar algo concreto");
        }

        PlanAction action;
        try
        {
            action = new PlanAction(person.Id, request.SkillId, skill.Level, request.TargetLevel, request.DueMonth, request.Title);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        await planActionRepository.AddAsync(action, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreatePlanActionResponse(context.BuildPlan(person, [.. existingActions, action]));
    }
}
