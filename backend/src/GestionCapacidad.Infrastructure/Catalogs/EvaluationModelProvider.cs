using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Infrastructure.Catalogs;

/// <summary>
/// Compone el modelo de evaluación vigente desde los parámetros de Admin —el
/// pool de preguntas, las bandas de talla y el mix de capacidades— más las
/// piezas que Admin no administra y son del motor: cómo se responde cada
/// pregunta (tipo y escala), el tamizaje y la acción recomendada por talla.
///
/// Se resuelve en cada petición: editar una banda en Admin cambia la
/// siguiente evaluación, no las guardadas, que son snapshots.
/// </summary>
public sealed class EvaluationModelProvider(
    ISingleDocumentRepository<QuestionPool> questionPools,
    ISingleDocumentRepository<TallaBandSet> tallaBands,
    ISingleDocumentRepository<CapabilityMix> capabilityMixes) : IEvaluationModelProvider
{
    public async Task<EvaluationModelDto> GetAsync(CancellationToken cancellationToken = default)
    {
        QuestionPool pool =
            await questionPools.GetAsync(cancellationToken) ?? ModelParameterDefaults.QuestionPool();
        TallaBandSet bands =
            await tallaBands.GetAsync(cancellationToken) ?? ModelParameterDefaults.TallaBands();
        CapabilityMix mix =
            await capabilityMixes.GetAsync(cancellationToken) ?? ModelParameterDefaults.CapabilityMix();

        List<PoolQuestion> questions = [.. pool.Questions.OrderBy(q => q.Position)];
        List<TallaBand> orderedBands = [.. bands.Bands.OrderBy(b => b.Position)];

        return new EvaluationModelDto(
            // El orden de las dimensiones es el orden en que aparecen sus
            // preguntas, no un listado aparte que pudiera discrepar.
            Dimensions: [.. questions.Select(q => q.Dimension.Value).Distinct(StringComparer.Ordinal)],
            Questions: [.. questions.Select(ToQuestionDto)],
            Triage: [.. EvaluationModelCatalog.Triage],
            Bands: [.. orderedBands.Select((band, index) => ToBandDto(band, index, bands.Boundaries))],
            Mix:
            [
                .. mix.Rows
                    .OrderBy(r => r.Position)
                    .Select(r => new CapabilityMixModelDto(
                        r.Capacidad,
                        r.PorTalla.ToDictionary(pair => pair.Key, pair => pair.Value))),
            ]);
    }

    private static EvaluationQuestionDto ToQuestionDto(PoolQuestion question)
    {
        (string kind, IReadOnlyList<string> scale) = EvaluationModelCatalog.KindOf(question.Code);

        return new EvaluationQuestionDto(
            Id: question.Code,
            Dimension: question.Dimension.Value,
            Text: question.Texto,
            Weight: question.Peso,
            Kind: kind,
            Scale: scale);
    }

    /// <summary>
    /// El rango de porcentaje sale de los cortes, no se guarda: la frontera
    /// pertenece a la banda de abajo, así que si el corte es 20, XS llega
    /// hasta 20 y S arranca en 21.
    /// </summary>
    private static TallaBandModelDto ToBandDto(TallaBand band, int index, IReadOnlyList<decimal> boundaries)
    {
        List<decimal> edges = [TallaBandSet.RangeMin, .. boundaries, TallaBandSet.RangeMax];

        return new TallaBandModelDto(
            Talla: band.Talla,
            MinPct: index == 0 ? edges[0] : edges[index] + 1,
            MaxPct: edges[index + 1],
            PmMin: band.PmMin,
            PmMax: band.PmMax,
            Lectura: band.Lectura,
            Action: EvaluationModelCatalog.ActionFor(band.Talla));
    }
}
