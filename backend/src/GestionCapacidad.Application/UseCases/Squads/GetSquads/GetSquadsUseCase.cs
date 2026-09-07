using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquads;

public sealed class GetSquadsUseCase(
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    IInitiativeRepository initiativeRepository)
    : IUseCase<GetSquadsRequest, GetSquadsResponse>
{
    public async Task<GetSquadsResponse> ExecuteAsync(
        GetSquadsRequest request,
        CancellationToken cancellationToken = default)
    {
        (IReadOnlyList<Squad> squads, int totalCount) = await squadRepository.GetPagedAsync(
            request.Page,
            request.PageSize,
            request.Search,
            request.Criticalities,
            cancellationToken);

        SquadAggregates aggregates = SquadAggregates.Build(
            await allocationRepository.GetAllAsync(cancellationToken),
            await personRepository.GetAllAsync(cancellationToken),
            await initiativeRepository.GetAllAsync(cancellationToken));

        var dtos = squads.Select(s => SquadMappings.ToDto(s, aggregates.For(s.Id))).ToList();

        return new GetSquadsResponse(
            PagedResult<SquadDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
