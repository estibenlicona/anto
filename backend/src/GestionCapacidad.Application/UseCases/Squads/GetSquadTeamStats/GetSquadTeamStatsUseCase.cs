using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquadTeamStats;

public sealed record GetSquadTeamStatsRequest(Guid SquadId);

public sealed record GetSquadTeamStatsResponse(SquadTeamStatsDto Stats);

/// <summary>
/// Resumen del equipo de una célula: el equipo completo (sin la muestra de 3
/// del listado) y los extremos de la escala — expertos (nivel 4) y
/// principiantes (nivel 1).
/// </summary>
public sealed class GetSquadTeamStatsUseCase(
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    IInitiativeRepository initiativeRepository) : IUseCase<GetSquadTeamStatsRequest, GetSquadTeamStatsResponse>
{
    public async Task<GetSquadTeamStatsResponse> ExecuteAsync(
        GetSquadTeamStatsRequest request,
        CancellationToken cancellationToken = default)
    {
        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");
        }

        SquadAggregates aggregates = SquadAggregates.Build(
            await allocationRepository.GetAllAsync(cancellationToken),
            await personRepository.GetAllAsync(cancellationToken),
            await initiativeRepository.GetAllAsync(cancellationToken));
        SquadAggregate own = aggregates.For(squad.Id);

        return new GetSquadTeamStatsResponse(new SquadTeamStatsDto(
            own.MemberCount,
            own.Members,
            own.ExpertCount,
            own.BeginnerCount,
            own.AllocatedFte,
            own.BauFte,
            own.TransformationFte,
            own.PeopleAvailableFte));
    }
}
