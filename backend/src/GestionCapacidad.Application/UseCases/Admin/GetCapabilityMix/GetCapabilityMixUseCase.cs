using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Admin.GetCapabilityMix;

public sealed record GetCapabilityMixResponse(IReadOnlyList<CapabilityMixRowDto> Rows);

/// <summary>El mix vigente, o el de referencia si nadie lo ha guardado.</summary>
public sealed class GetCapabilityMixUseCase(ISingleDocumentRepository<CapabilityMix> repository)
    : IUseCase<GetCapabilityMixResponse>
{
    public async Task<GetCapabilityMixResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        CapabilityMix mix =
            await repository.GetAsync(cancellationToken) ?? ModelParameterDefaults.CapabilityMix();

        return new GetCapabilityMixResponse(ModelParameterMappings.ToDto(mix));
    }
}
