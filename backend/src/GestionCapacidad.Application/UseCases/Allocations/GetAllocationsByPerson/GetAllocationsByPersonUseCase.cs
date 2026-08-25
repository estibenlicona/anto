using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;

public sealed class GetAllocationsByPersonUseCase(
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    ISquadRepository squadRepository) : IUseCase<Guid, GetAllocationsByPersonResponse>
{
    public async Task<GetAllocationsByPersonResponse> ExecuteAsync(
        Guid personId, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Allocation> allocations = await allocationRepository.GetByPersonAsync(personId, cancellationToken);

        var squadIds = allocations.Select(a => a.SquadId).Distinct().ToList();
        Person? person = await personRepository.GetByIdAsync(personId, cancellationToken);
        var squads = await Task.WhenAll(squadIds.Select(id => squadRepository.GetByIdAsync(id, cancellationToken)));

        var squadMap = squads.Where(s => s is not null).ToDictionary(s => s!.Id, s => s!.Name);
        var personName = person?.Name ?? string.Empty;

        var dtos = allocations
            .OrderBy(a => squadMap.GetValueOrDefault(a.SquadId))
            .Select(a => AllocationMappings.ToDto(a, personName, squadMap.GetValueOrDefault(a.SquadId, string.Empty)))
            .ToList();

        return new GetAllocationsByPersonResponse(dtos);
    }
}
