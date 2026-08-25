using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquads;

public sealed class GetSquadsUseCase(ISquadRepository squadRepository)
    : IUseCase<GetSquadsRequest, GetSquadsResponse>
{
    public async Task<GetSquadsResponse> ExecuteAsync(
        GetSquadsRequest request,
        CancellationToken cancellationToken = default)
    {
        (IReadOnlyList<Squad> squads, int totalCount) = await squadRepository.GetPagedAsync(
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = squads.Select(SquadMappings.ToDto).ToList();

        return new GetSquadsResponse(
            PagedResult<SquadDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
