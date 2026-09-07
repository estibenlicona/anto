using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Admin.GetSprintConfig;

public sealed record GetSprintConfigResponse(SprintConfigDto Config);

/// <summary>
/// El calendario vigente. Mientras nadie lo haya guardado responde el de
/// referencia sin persistirlo: la pantalla tiene qué mostrar y Capacidad qué
/// leer desde el primer arranque, con cualquier provider.
/// </summary>
public sealed class GetSprintConfigUseCase(ISingleDocumentRepository<SprintConfiguration> repository)
    : IUseCase<GetSprintConfigResponse>
{
    public async Task<GetSprintConfigResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        SprintConfiguration config =
            await repository.GetAsync(cancellationToken) ?? ModelParameterDefaults.SprintConfiguration();

        return new GetSprintConfigResponse(ModelParameterMappings.ToDto(config));
    }
}
