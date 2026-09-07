using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.AddExpertiseLinePeople;

public sealed record AddExpertiseLinePeopleRequest(Guid Id, IReadOnlyList<Guid> PersonIds);

public sealed record AddExpertiseLinePeopleResponse(ExpertiseLineDetailDto Line);

/// <summary>Incorpora una o varias personas a la línea, moviéndolas desde la que tuvieran.</summary>
public sealed class AddExpertiseLinePeopleUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<AddExpertiseLinePeopleRequest, AddExpertiseLinePeopleResponse>
{
    public async Task<AddExpertiseLinePeopleResponse> ExecuteAsync(
        AddExpertiseLinePeopleRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        foreach (Guid personId in request.PersonIds)
        {
            Person? person = await personRepository.GetByIdAsync(personId, cancellationToken);
            if (person is null)
            {
                throw new NotFoundException("Línea o persona no encontrada");
            }

            person.AssignToExpertiseLine(line.Id);
            personRepository.Update(person);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        Person? lead = line.LeadId is Guid leadId ? await personRepository.GetByIdAsync(leadId, cancellationToken) : null;
        IReadOnlyList<Allocation> allocations = await allocationRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Allocation> allocationByPerson = allocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.First());
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, string> squadNameById = squads.ToDictionary(s => s.Id, s => s.Name);

        return new AddExpertiseLinePeopleResponse(
            ExpertiseLineMappings.ToDetailDto(line, linePeople, lead, allocationByPerson, squadNameById));
    }
}
