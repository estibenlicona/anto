using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.ControlTower;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ControlTower.GetChapterCapacityOverview;

public sealed record GetChapterCapacityOverviewResponse(CapacityOverviewDto Overview);

/// <summary>El resumen de capacidad del chapter para la raíz de Chapter Lead.</summary>
public sealed class GetChapterCapacityOverviewUseCase(
    IPersonRepository personRepository,
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IInitiativeRepository initiativeRepository) : IUseCase<GetChapterCapacityOverviewResponse>
{
    public async Task<GetChapterCapacityOverviewResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Allocation> allocations = await allocationRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Initiative> initiatives = await initiativeRepository.GetAllAsync(cancellationToken);

        return new GetChapterCapacityOverviewResponse(
            ChapterCapacityOverviewCalculator.Compute(people, squads, allocations, initiatives));
    }
}
