using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;

public sealed class GetInitiativeByIdUseCase(IInitiativeRepository initiativeRepository) : IUseCase<GetInitiativeByIdRequest, GetInitiativeByIdResponse>
{
    public async Task<GetInitiativeByIdResponse> ExecuteAsync(
        GetInitiativeByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
            throw new NotFoundException($"Initiative with id '{request.Id}' was not found.");

        return new GetInitiativeByIdResponse(InitiativeMappings.ToDto(initiative));
    }
}
