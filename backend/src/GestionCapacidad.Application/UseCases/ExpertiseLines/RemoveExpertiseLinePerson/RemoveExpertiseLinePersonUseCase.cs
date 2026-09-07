using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.RemoveExpertiseLinePerson;

public sealed record RemoveExpertiseLinePersonRequest(Guid Id, Guid PersonId);

public sealed record RemoveExpertiseLinePersonResponse(ExpertiseLineDetailDto Line);

/// <summary>Quita a una persona de la línea. Al lead no se le puede quitar así — primero hay que designar otro o quitarle el rol.</summary>
public sealed class RemoveExpertiseLinePersonUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<RemoveExpertiseLinePersonRequest, RemoveExpertiseLinePersonResponse>
{
    public async Task<RemoveExpertiseLinePersonResponse> ExecuteAsync(
        RemoveExpertiseLinePersonRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null || person.ExpertiseLineId != line.Id)
        {
            throw new NotFoundException("Línea o persona no encontrada");
        }

        if (line.LeadId == person.Id)
        {
            throw new BadRequestException(
                "No se puede quitar de la línea a quien la lidera: designe otro lead o quítele el rol primero");
        }

        person.RemoveFromExpertiseLine();
        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        Person? lead = line.LeadId is Guid leadId ? await personRepository.GetByIdAsync(leadId, cancellationToken) : null;
        IReadOnlyList<Allocation> allocations = await allocationRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Allocation> allocationByPerson = allocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.First());
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, string> squadNameById = squads.ToDictionary(s => s.Id, s => s.Name);

        return new RemoveExpertiseLinePersonResponse(
            ExpertiseLineMappings.ToDetailDto(line, linePeople, lead, allocationByPerson, squadNameById));
    }
}
