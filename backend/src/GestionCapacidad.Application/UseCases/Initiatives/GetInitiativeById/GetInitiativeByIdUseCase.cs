using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;

public sealed record GetInitiativeByIdRequest(Guid Id);

public sealed record GetInitiativeByIdResponse(InitiativeDto Initiative);

public sealed class GetInitiativeByIdUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository) : IUseCase<GetInitiativeByIdRequest, GetInitiativeByIdResponse>
{
    public async Task<GetInitiativeByIdResponse> ExecuteAsync(
        GetInitiativeByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
        {
            throw new NotFoundException("Iniciativa no encontrada");
        }

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new GetInitiativeByIdResponse(context.ToDto(initiative));
    }
}
