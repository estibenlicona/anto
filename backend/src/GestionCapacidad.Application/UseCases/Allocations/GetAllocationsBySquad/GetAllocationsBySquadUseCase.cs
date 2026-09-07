using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;

public sealed class GetAllocationsBySquadUseCase(
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository) : IUseCase<GetAllocationsBySquadRequest, GetAllocationsBySquadResponse>
{
    public async Task<GetAllocationsBySquadResponse> ExecuteAsync(
        GetAllocationsBySquadRequest request, CancellationToken cancellationToken = default)
    {
        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");

        (IReadOnlyList<(Allocation Allocation, Person Person)> items, int totalCount) =
            await allocationRepository.GetBySquadPagedAsync(
                request.SquadId,
                request.Page,
                request.PageSize,
                request.Search,
                request.Levels,
                cancellationToken);

        var dtos = items
            .Select(x => AllocationMappings.ToDto(x.Allocation, x.Person, squad.Name))
            .ToList();

        return new GetAllocationsBySquadResponse(
            PagedResult<AllocationDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
