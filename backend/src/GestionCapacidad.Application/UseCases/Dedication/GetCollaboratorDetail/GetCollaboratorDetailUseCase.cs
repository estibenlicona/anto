using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Dedication.GetCollaboratorDetail;

public sealed record GetCollaboratorDetailRequest(Guid PersonId, string? Sprint);

public sealed record GetCollaboratorDetailResponse(CollaboratorDedicationDetailDto Detail);

/// <summary>El dashboard de balance de un colaborador: cabecera del sprint elegido y tendencia de la ventana de histórico.</summary>
public sealed class GetCollaboratorDetailUseCase(
    IPersonRepository personRepository,
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IInitiativeRepository initiativeRepository,
    ISprintRepository sprintRepository,
    ISprintSnapshotRepository snapshotRepository,
    ISingleDocumentRepository<SprintConfiguration> settingsRepository,
    IAbsenceRepository absenceRepository,
    TimeProvider timeProvider) : IUseCase<GetCollaboratorDetailRequest, GetCollaboratorDetailResponse>
{
    public async Task<GetCollaboratorDetailResponse> ExecuteAsync(
        GetCollaboratorDetailRequest request,
        CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        IReadOnlyList<Person> allPeople = await personRepository.GetAllAsync(cancellationToken);

        DedicationContext context = await DedicationContext.BuildAsync(
            allPeople, squadRepository, allocationRepository, initiativeRepository, sprintRepository,
            snapshotRepository, settingsRepository, absenceRepository, today, cancellationToken);

        Sprint? chosen = context.ResolveSprint(request.Sprint);
        if (chosen is null && !string.IsNullOrWhiteSpace(request.Sprint))
        {
            throw new BadRequestException("Sprint inválido");
        }

        CollaboratorDedicationDetailDto detail = await context.BuildDetailAsync(person, chosen, cancellationToken);
        return new GetCollaboratorDetailResponse(detail);
    }
}
