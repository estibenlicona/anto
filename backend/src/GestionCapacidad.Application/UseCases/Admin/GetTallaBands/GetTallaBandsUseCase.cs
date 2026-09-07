using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Admin.GetTallaBands;

public sealed record GetTallaBandsResponse(TallaBandsDto Bands);

/// <summary>Las bandas vigentes, o las de referencia si nadie las ha guardado.</summary>
public sealed class GetTallaBandsUseCase(ISingleDocumentRepository<TallaBandSet> repository)
    : IUseCase<GetTallaBandsResponse>
{
    public async Task<GetTallaBandsResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        TallaBandSet bands =
            await repository.GetAsync(cancellationToken) ?? ModelParameterDefaults.TallaBands();

        return new GetTallaBandsResponse(ModelParameterMappings.ToDto(bands));
    }
}
