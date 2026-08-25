using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquadById;

public sealed class GetSquadByIdUseCase(ISquadRepository squadRepository) : IUseCase<GetSquadByIdRequest, GetSquadByIdResponse>
{
    public async Task<GetSquadByIdResponse> ExecuteAsync(
        GetSquadByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Squad? squad = await squadRepository.GetByIdAsync(request.Id, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.Id}' was not found.");
        }

        return new GetSquadByIdResponse(SquadMappings.ToDto(squad));
    }
}
