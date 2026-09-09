using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

/// <summary>
/// Arma un modelo con una versión completa y válida, para que cada test rompa
/// una sola cosa y se vea cuál. Es el mismo contenido que el modelo `base` de
/// los casos dorados, de modo que lo que acá se declara válido sea exactamente
/// lo que allá se calcula.
/// </summary>
public static class EstimationModelBuilder
{
    public const string Author = "Estiben Licona";

    public static readonly DateTime At = new(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);

    public static EstimationModel WithValidDraft()
    {
        var model = new EstimationModel("Estimación paramétrica", EstimationPhase.Inicial);
        ModelVersion draft = model.StartFirstVersion(Author, At);
        FillValid(draft);
        return model;
    }

    /// <summary>Un modelo con la versión 1 vigente y un borrador abierto sobre ella.</summary>
    public static EstimationModel WithPublishedAndDraft()
    {
        EstimationModel model = WithValidDraft();
        model.Publish(1, new DateOnly(2026, 3, 1), "Primera versión.", Author, [], At);
        model.CreateVersionFrom(1, Author, At);
        return model;
    }

    public static void FillValid(ModelVersion version)
    {
        version.ReplaceDimensions(
            [
                new ModelDimension("ALC", "Alcance", 1, active: true),
                new ModelDimension("RSG", "Riesgo", 2, active: true),
            ],
            Author,
            At);

        version.ReplaceDrivers(
            [
                new ModelDriver("VOL", "Volumen de alcance", [EstimationOutput.Size, EstimationOutput.Effort]),
                new ModelDriver("INC", "Incertidumbre", [EstimationOutput.Risk]),
                new ModelDriver("INT", "Integración con terceros", [EstimationOutput.Size, EstimationOutput.Mix]),
            ],
            Author,
            At);

        version.ReplaceQuestions([.. ValidQuestions()], Author, At);

        version.ReplaceTriage(
            [
                new ModelTriageQuestion(0, "T1", "¿Toca datos personales?", critical: true),
                new ModelTriageQuestion(1, "T2", "¿Requiere una habilidad que la célula no tiene?", critical: false),
            ],
            Author,
            At);

        version.ReplaceTallaRules([20m, 40m, 60m, 80m], [.. ValidTallaRules()], Author, At);

        version.ReplaceRiskBands(
            [
                new ModelRiskBand(0, "Bajo", 33m),
                new ModelRiskBand(1, "Medio", 66m),
                new ModelRiskBand(2, "Alto", 100m),
            ],
            Author,
            At);

        version.ReplaceMix([.. ValidMix()], Author, At);

        version.ReplaceMixModifiers(
            [
                new MixModifier(
                    0,
                    "MOD-INT",
                    "INT",
                    MixConditionOperator.Gte,
                    0.75m,
                    ["M", "L", "XL"],
                    [new MixAdjustment(0, "backend", -10m), new MixAdjustment(1, "qa", 10m)]),
            ],
            Author,
            At);
    }

    public static IEnumerable<ModelQuestion> ValidQuestions() =>
    [
        new ModelQuestion(
            0, "Q1", "ALC", "¿Cuántas pantallas nuevas requiere?",
            EstimationQuestionType.Cuantitativa, "pantallas", "VOL", active: true,
            [
                new ModelQuestionOption(0, "1 a 5", 0.0m, 1m, 5m),
                new ModelQuestionOption(1, "6 a 20", 0.5m, 5m, 20m),
                new ModelQuestionOption(2, "más de 20", 1.0m, 20m, null),
            ],
            new Dictionary<EstimationOutput, decimal>
            {
                [EstimationOutput.Size] = 4m,
                [EstimationOutput.Effort] = 4m,
            }),
        new ModelQuestion(
            1, "Q2", "ALC", "¿Cuántas integraciones con sistemas de terceros involucra?",
            EstimationQuestionType.Evaluativa, null, "INT", active: true,
            [
                new ModelQuestionOption(0, "Ninguna", 0.0m, null, null),
                new ModelQuestionOption(1, "Una", 0.5m, null, null),
                new ModelQuestionOption(2, "Varias", 1.0m, null, null),
            ],
            new Dictionary<EstimationOutput, decimal>
            {
                [EstimationOutput.Size] = 2m,
                [EstimationOutput.Mix] = 1m,
            }),
        new ModelQuestion(
            2, "Q3", "RSG", "¿Depende de un proveedor externo para arrancar?",
            EstimationQuestionType.Binaria, null, "INC", active: true,
            [
                new ModelQuestionOption(0, "No", 0.0m, null, null),
                new ModelQuestionOption(1, "Sí", 1.0m, null, null),
            ],
            new Dictionary<EstimationOutput, decimal> { [EstimationOutput.Risk] = 3m }),
        new ModelQuestion(
            3, "Q4", "RSG", "¿Qué tan clara está la definición funcional?",
            EstimationQuestionType.Evaluativa, null, "INC", active: true,
            [
                new ModelQuestionOption(0, "Baja", 0.0m, null, null),
                new ModelQuestionOption(1, "Media", 0.5m, null, null),
                new ModelQuestionOption(2, "Alta", 1.0m, null, null),
            ],
            new Dictionary<EstimationOutput, decimal>
            {
                // Peso cero, que no es lo mismo que ausente: la pregunta aporta
                // a tamaño, y en esta versión aporta cero.
                [EstimationOutput.Size] = 0m,
                [EstimationOutput.Effort] = 2m,
                [EstimationOutput.Risk] = 1m,
            }),
    ];

    public static IEnumerable<ModelTallaRule> ValidTallaRules() =>
    [
        new ModelTallaRule(0, "XS", 0.5m, 1.0m, 2.0m, "Cabe en un sprint", "Ejecutar"),
        new ModelTallaRule(1, "S", 2.0m, 3.0m, 5.0m, "Un trimestre corto", "Ejecutar"),
        new ModelTallaRule(2, "M", 5.0m, 6.0m, 9.0m, "Un trimestre completo", "Planificar"),
        new ModelTallaRule(3, "L", 9.0m, 12.0m, 16.0m, "Más de un trimestre", "Partir"),
        new ModelTallaRule(4, "XL", 16.0m, 20.0m, 30.0m, "Un semestre o más", "Partir"),
    ];

    public static IEnumerable<ModelMixRow> ValidMix() =>
    [
        new ModelMixRow(0, "backend", "Backend", Column(60m, 50m, 50m, 40m, 40m)),
        new ModelMixRow(1, "frontend", "Frontend", Column(20m, 30m, 25m, 30m, 30m)),
        new ModelMixRow(2, "qa", "QA", Column(20m, 20m, 25m, 30m, 30m)),
    ];

    public static Dictionary<string, decimal> Column(decimal xs, decimal s, decimal m, decimal l, decimal xl) =>
        new(StringComparer.Ordinal) { ["XS"] = xs, ["S"] = s, ["M"] = m, ["L"] = l, ["XL"] = xl };
}
