using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseRoster;

public sealed record GetExpertiseRosterResponse(IReadOnlyList<RosterPersonDto> People);

/// <summary>Todas las personas del chapter con la línea a la que pertenecen, o ninguna.</summary>
public sealed class GetExpertiseRosterUseCase(
    IPersonRepository personRepository,
    IExpertiseLineRepository lineRepository) : IUseCase<GetExpertiseRosterResponse>
{
    public async Task<GetExpertiseRosterResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<ExpertiseLine> lines = await lineRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, ExpertiseLine> linesById = lines.ToDictionary(l => l.Id);

        List<RosterPersonDto> roster =
        [
            .. people.Select(p => ExpertiseLineMappings.ToRosterDto(
                p, p.ExpertiseLineId is Guid lineId ? linesById.GetValueOrDefault(lineId) : null)),
        ];

        return new GetExpertiseRosterResponse(roster);
    }
}
