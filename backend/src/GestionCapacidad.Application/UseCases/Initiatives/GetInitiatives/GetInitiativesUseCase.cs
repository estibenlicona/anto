using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;

public sealed class GetInitiativesUseCase(IInitiativeRepository initiativeRepository) : IUseCase<Guid, GetInitiativesResponse>
{
    public async Task<GetInitiativesResponse> ExecuteAsync(
        Guid squadId,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Initiative> initiatives = await initiativeRepository.GetBySquadAsync(squadId, cancellationToken);

        var dtos = initiatives
            .OrderBy(i => i.Name)
            .Select(InitiativeMappings.ToDto)
            .ToList();

        return new GetInitiativesResponse(dtos);
    }
}
