using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;

public sealed class GetAllocationsBySquadUseCase(
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository) : IUseCase<GetAllocationsBySquadRequest, GetAllocationsBySquadResponse>
{
    public async Task<GetAllocationsBySquadResponse> ExecuteAsync(
        GetAllocationsBySquadRequest request, CancellationToken cancellationToken = default)
    {
        (IReadOnlyList<(Allocation Allocation, string PersonName)> items, int totalCount) =
            await allocationRepository.GetBySquadPagedAsync(
                request.SquadId, request.Page, request.PageSize, cancellationToken);

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        string squadName = squad?.Name ?? string.Empty;

        var dtos = items
            .Select(x => AllocationMappings.ToDto(x.Allocation, x.PersonName, squadName))
            .ToList();

        return new GetAllocationsBySquadResponse(
            PagedResult<AllocationDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
