using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLines;

public sealed record GetExpertiseLinesResponse(IReadOnlyList<ExpertiseLineDto> Lines);

/// <summary>Todas las líneas de expertise, activas y archivadas.</summary>
public sealed class GetExpertiseLinesUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository) : IUseCase<GetExpertiseLinesResponse>
{
    public async Task<GetExpertiseLinesResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<ExpertiseLine> lines = await lineRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Person> peopleById = people.ToDictionary(p => p.Id);

        List<ExpertiseLineDto> dtos = [];
        foreach (ExpertiseLine line in lines)
        {
            List<Person> linePeople = [.. people.Where(p => p.ExpertiseLineId == line.Id)];
            Person? lead = line.LeadId is Guid leadId ? peopleById.GetValueOrDefault(leadId) : null;
            dtos.Add(ExpertiseLineMappings.ToDto(line, linePeople, lead));
        }

        return new GetExpertiseLinesResponse(dtos);
    }
}
