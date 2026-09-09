using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Mappings;

/// <summary>
/// Lleva una versión del modelo del dominio al contrato que consumen el motor y
/// la API. Es la única traducción: el motor no conoce las entidades y el
/// cliente no conoce el dominio, así que si el rango de porcentaje de una talla
/// se calculara en dos lados, uno de los dos se equivocaría.
/// </summary>
public static class EstimationModelMappings
{
    public static EstimationModelVersionDto ToDto(this ModelVersion version, string modelId)
    {
        ArgumentNullException.ThrowIfNull(version);

        return new EstimationModelVersionDto(
            ModelId: modelId,
            VersionId: version.Id.ToString(),
            VersionNumber: version.Number,
            Dimensions:
            [
                .. version.Dimensions
                    .OrderBy(d => d.Order)
                    .Select(d => new ModelDimensionDto(d.Code, d.Name, d.Order, d.Active)),
            ],
            Drivers:
            [
                .. version.Drivers.Select(d => new ModelDriverDto(d.Code, d.Description, [.. d.Outputs])),
            ],
            Questions: [.. version.Questions.OrderBy(q => q.Position).Select(ToDto)],
            Triage:
            [
                .. version.TriageQuestions
                    .OrderBy(t => t.Position)
                    .Select(t => new EstimationTriageQuestionDto(t.Code, t.Texto, t.Critical)),
            ],
            TallaRules:
            [
                .. version.TallaRules
                    .OrderBy(r => r.Position)
                    .Select(r => new TallaRuleDto(
                        r.Talla,
                        // El rango sale de los cortes de la versión, que son la
                        // única fuente: la talla no guarda su propio mínimo.
                        version.MinPctOf(r),
                        version.MaxPctOf(r),
                        r.PmMin,
                        r.PmExpected,
                        r.PmMax,
                        r.Lectura,
                        r.Action)),
            ],
            RiskBands:
            [
                .. version.RiskBands
                    .OrderBy(b => b.Position)
                    .Select(b => new RiskBandDto(b.Level, b.MaxPct)),
            ],
            Mix:
            [
                .. version.Mix
                    .OrderBy(m => m.Position)
                    .Select(m => new MixRowDto(
                        m.Capacidad,
                        m.PorTalla.ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.Ordinal))),
            ],
            MixModifiers:
            [
                .. version.MixModifiers
                    .OrderBy(m => m.Position)
                    .Select(m => new MixModifierDto(
                        m.Code,
                        m.DriverCode,
                        m.ConditionOperator is MixConditionOperator.Lte ? "lte" : "gte",
                        m.Threshold,
                        [.. m.Tallas],
                        [.. m.Adjustments.Select(a => new MixAdjustmentDto(a.CapabilityKey, a.Points))])),
            ]);
    }

    private static ModelQuestionDto ToDto(ModelQuestion question) => new(
        Id: question.Code,
        Dimension: question.DimensionCode,
        Text: question.Texto,
        Type: question.Type,
        Unit: question.Unit,
        Driver: question.DriverCode,
        Active: question.Active,
        Options:
        [
            .. question.Options
                .OrderBy(o => o.Position)
                .Select(o => new QuestionOptionDto(o.Label, o.Score, o.From, o.To)),
        ],
        // Se copia el diccionario tal cual: una salida ausente sigue ausente, y
        // eso es lo que el cliente lee como "no aporta".
        Weights: question.Weights.ToDictionary(pair => pair.Key, pair => pair.Value));
}
