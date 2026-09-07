using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Dedication.SyncCollaborator;

public sealed record SyncCollaboratorCommand(Guid PersonId);

public sealed record SyncCollaboratorResponse(SyncResultDto Result);

/// <summary>
/// Trae los datos crudos de Azure DevOps para el sprint vigente de la
/// persona y los aplica sobre su <see cref="SprintSnapshot"/>. Sólo toca
/// snapshots todavía no sellados — ver design.md, decisión 6.
/// </summary>
public sealed class SyncCollaboratorUseCase(
    IPersonRepository personRepository,
    ISprintRepository sprintRepository,
    ISprintSnapshotRepository snapshotRepository,
    IAzureDevOpsClient client,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IUseCase<SyncCollaboratorCommand, SyncCollaboratorResponse>
{
    public async Task<SyncCollaboratorResponse> ExecuteAsync(
        SyncCollaboratorCommand request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        if (person.DevOpsUserId is null)
        {
            throw new BadRequestException("La persona no tiene una identidad de Azure DevOps vinculada");
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        IReadOnlyList<Sprint> sprints = await sprintRepository.GetAllAsync(cancellationToken);
        Sprint? currentSprint = sprints.FirstOrDefault(s => s.IsCurrent(today));
        if (currentSprint is null)
        {
            throw new BadRequestException("No hay ningún sprint vigente para sincronizar");
        }

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        SprintSnapshot? snapshot = await snapshotRepository.GetByPersonAndSprintAsync(
            person.Id, currentSprint.Id, cancellationToken);
        if (snapshot is not null && snapshot.Status == SnapshotStatus.Sealed)
        {
            // Ya sellado: nada que actualizar, pero la llamada no es un error.
            return new SyncCollaboratorResponse(new SyncResultDto(now));
        }

        AzureDevOpsSyncDataDto raw = await client.GetCollaboratorSyncDataAsync(
            person.DevOpsUserId, currentSprint.StartDate, currentSprint.EndDate, cancellationToken);
        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, currentSprint.StartDate);

        var isNew = snapshot is null;
        snapshot ??= new SprintSnapshot(person.Id, currentSprint.Id);
        snapshot.SetExecution(
            result.CommittedAtStartPoints, result.AddedDuringSprintPoints, null, null,
            result.Wip, snapshot.OtherUnavailableDays);
        snapshot.ReplaceInitiatives(result.Initiatives);
        snapshot.ReplaceWorkItems(result.WorkItems);
        snapshot.ReplaceActivity(result.Activity);

        if (isNew)
        {
            await snapshotRepository.AddAsync(snapshot, cancellationToken);
        }
        else
        {
            snapshotRepository.Update(snapshot);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SyncCollaboratorResponse(new SyncResultDto(now));
    }
}
