using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Dedication.SyncCollaborator;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Dedication.SyncAllCollaborators;

public sealed record SyncAllCollaboratorsResponse(SyncResultDto Result);

/// <summary>
/// Sincroniza a todas las personas con identidad DevOps vinculada. Nadie
/// vinculado todavía es un resultado válido, no un error; sólo propaga 502
/// si absolutamente ninguna sincronización individual tuvo éxito.
/// </summary>
public sealed class SyncAllCollaboratorsUseCase(
    IPersonRepository personRepository,
    SyncCollaboratorUseCase syncCollaboratorUseCase,
    TimeProvider timeProvider) : IUseCase<SyncAllCollaboratorsResponse>
{
    public async Task<SyncAllCollaboratorsResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);
        List<Person> withIdentity = [.. people.Where(p => p.DevOpsUserId is not null)];

        var succeeded = 0;
        ExternalServiceUnavailableException? lastFailure = null;
        foreach (Person person in withIdentity)
        {
            try
            {
                await syncCollaboratorUseCase.ExecuteAsync(new SyncCollaboratorCommand(person.Id), cancellationToken);
                succeeded++;
            }
            catch (ExternalServiceUnavailableException exception)
            {
                lastFailure = exception;
            }
        }

        if (withIdentity.Count > 0 && succeeded == 0 && lastFailure is not null)
        {
            throw lastFailure;
        }

        return new SyncAllCollaboratorsResponse(new SyncResultDto(timeProvider.GetUtcNow().UtcDateTime));
    }
}
