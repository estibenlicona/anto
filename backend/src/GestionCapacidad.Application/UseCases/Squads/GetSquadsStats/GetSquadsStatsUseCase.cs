using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquadsStats;

public sealed record GetSquadsStatsResponse(SquadsStatsDto Stats);

/// <summary>
/// Resumen agregado de células sobre el total (sin paginar ni filtrar). Los
/// totales de FTE suman los valores por célula ya redondeados — la misma
/// cuenta del mock, para que las cifras coincidan con las de MSW.
/// </summary>
public sealed class GetSquadsStatsUseCase(
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    IInitiativeRepository initiativeRepository) : IUseCase<GetSquadsStatsResponse>
{
    public async Task<GetSquadsStatsResponse> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);

        SquadAggregates aggregates = SquadAggregates.Build(
            await allocationRepository.GetAllAsync(cancellationToken),
            people,
            await initiativeRepository.GetAllAsync(cancellationToken));

        var perSquad = squads.Select(s => aggregates.For(s.Id)).ToList();
        double Total(Func<SquadAggregate, double> pick) => FteMath.Round1(perSquad.Sum(pick));

        var stats = new SquadsStatsDto(
            TotalCount: squads.Count,
            WithoutPeopleCount: perSquad.Count(a => a.MemberCount == 0),
            // Con gente y sin margen: el asignado alcanzó (o superó) lo que su
            // gente declara disponible — ver la nota de FteMath.
            AtCapacityCount: perSquad.Count(a => a.MemberCount > 0 && a.AllocatedFte >= a.PeopleAvailableFte),
            TeamCount: squads.Select(s => s.TeamId).Distinct().Count(),
            AllocatedFte: Total(a => a.AllocatedFte),
            BauFte: Total(a => a.BauFte),
            TransformationFte: Total(a => a.TransformationFte),
            ChapterFte: FteMath.AvailableFteOf(people.Select(p => p.AvailableFte.Value)),
            ByCriticality: Criticality.ValidValues
                .Select(c => new CriticalityBucketDto(
                    c,
                    squads.Count(s => s.Criticality.Value == c)))
                .ToList());

        return new GetSquadsStatsResponse(stats);
    }
}
