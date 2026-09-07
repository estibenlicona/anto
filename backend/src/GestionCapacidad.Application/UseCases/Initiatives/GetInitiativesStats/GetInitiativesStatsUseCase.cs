using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiativesStats;

public sealed record GetInitiativesStatsResponse(InitiativesStatsDto Stats);

/// <summary>
/// El resumen del módulo, sobre el total y no sobre la página. Las tallas
/// salen del modelo vigente y viajan todas, también en cero: la tarjeta dibuja
/// la escala completa, y una talla ausente se leería como una escala distinta.
/// </summary>
public sealed class GetInitiativesStatsUseCase(
    IInitiativeRepository initiativeRepository,
    IEvaluationModelProvider modelProvider) : IUseCase<GetInitiativesStatsResponse>
{
    public async Task<GetInitiativesStatsResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Initiative> all = await initiativeRepository.GetAllAsync(cancellationToken);
        EvaluationModelDto model = await modelProvider.GetAsync(cancellationToken);

        List<Initiative> active = [.. all.Where(i => i.Status.IsActive)];

        var stats = new InitiativesStatsDto(
            Total: all.Count,
            Unevaluated: all.Count(i => i.Evaluation is null),
            Active: active.Count,
            ActiveByTalla:
            [
                .. model.Bands.Select(band => new TallaBucketDto(
                    band.Talla,
                    active.Count(i => i.Evaluation is not null &&
                                      string.Equals(i.Evaluation.Talla, band.Talla, StringComparison.Ordinal)))),
            ],
            // La demanda del chapter: lo que las activas piden hoy. A dos
            // decimales, que es como se lee un FTE agregado.
            FteDemand: Math.Round(
                active.Sum(i => i.Evaluation?.FteExpected ?? 0m), 2, MidpointRounding.AwayFromZero));

        return new GetInitiativesStatsResponse(stats);
    }
}
