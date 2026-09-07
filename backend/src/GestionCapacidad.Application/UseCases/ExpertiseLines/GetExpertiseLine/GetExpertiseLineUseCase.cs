using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLine;

public sealed record GetExpertiseLineRequest(Guid Id);

public sealed record GetExpertiseLineResponse(ExpertiseLineDetailDto Line);

/// <summary>El detalle de una línea: su gente, con quién es el lead marcado, y su capacidad.</summary>
public sealed class GetExpertiseLineUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository) : IUseCase<GetExpertiseLineRequest, GetExpertiseLineResponse>
{
    public async Task<GetExpertiseLineResponse> ExecuteAsync(GetExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        Person? lead = line.LeadId is Guid leadId ? await personRepository.GetByIdAsync(leadId, cancellationToken) : null;

        IReadOnlyList<Allocation> allocations = await allocationRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Allocation> allocationByPerson = allocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.First());
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, string> squadNameById = squads.ToDictionary(s => s.Id, s => s.Name);

        return new GetExpertiseLineResponse(
            ExpertiseLineMappings.ToDetailDto(line, linePeople, lead, allocationByPerson, squadNameById));
    }
}
