using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Catalogs;

namespace GestionCapacidad.Infrastructure.Persistence;

/// <summary>
/// Convierte los parámetros de hoy —pool de preguntas, bandas de talla y mix de
/// capacidades, cada uno un agregado de fila única— en la versión 1 del modelo
/// versionado.
///
/// La conversión es literal a propósito: describe lo que el sistema ya venía
/// haciendo, no lo que debería hacer. Por eso los pesos van sólo a tamaño y
/// esfuerzo —hoy hay un único puntaje que decide las dos cosas— y la salida de
/// riesgo queda sin ninguna pregunta que la alimente. Eso hace que la versión 1
/// no pase el chequeo de pesos, y está bien: es exactamente el segundo agujero
/// que el cambio viene a cerrar, y queda registrado en el log de la migración
/// en vez de disimulado con pesos inventados.
/// </summary>
public static class LegacyModelConversion
{
    public const string ModelName = "Estimación paramétrica de iniciativas";
    public const string Author = "Migración a modelo versionado";
    public const string Note = "Versión inicial: los parámetros que regían antes del versionado.";

    /// <summary>La escala normalizada de las cinco opciones que hoy valen 0 a 4.</summary>
    private static readonly decimal[] NormalizedScores = [0m, 0.25m, 0.5m, 0.75m, 1m];

    /// <summary>
    /// Un código corto y estable por dimensión. Las dimensiones eran un conjunto
    /// cerrado en el código y pasan a ser datos: necesitan un identificador que
    /// no sea su nombre, porque el nombre es lo que se va a poder editar.
    /// </summary>
    private static readonly IReadOnlyDictionary<string, string> DimensionCodes =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["Negocio y cliente"] = "NEG",
            ["Alcance funcional"] = "ALC",
            ["Integraciones"] = "INT",
            ["Datos, seguridad y cumplimiento"] = "DAT",
            ["Tecnología y arquitectura"] = "TEC",
            ["Operación y soporte"] = "OPE",
            ["Incertidumbre y dependencias"] = "INC",
        };

    /// <summary>Las bandas de riesgo iniciales: hoy no existe ninguna escala de riesgo.</summary>
    private static readonly (string Level, decimal MaxPct)[] InitialRiskBands =
        [("Bajo", 33m), ("Medio", 66m), ("Alto", 100m)];

    public static EstimationModel BuildInitialModel(
        QuestionPool pool,
        TallaBandSet bands,
        CapabilityMix mix,
        DateOnly effectiveFrom,
        DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(pool);
        ArgumentNullException.ThrowIfNull(bands);
        ArgumentNullException.ThrowIfNull(mix);

        var model = new EstimationModel(ModelName, EstimationPhase.Inicial);
        ModelVersion version = model.StartFirstVersion(Author, atUtc);

        List<PoolQuestion> questions = [.. pool.Questions.OrderBy(q => q.Position)];

        // El orden de las dimensiones es el orden en que aparecen sus preguntas,
        // igual que lo resuelve hoy el proveedor del modelo.
        List<string> dimensionNames =
        [
            .. questions.Select(q => q.Dimension.Value).Distinct(StringComparer.Ordinal),
        ];

        version.ReplaceDimensions(
            [
                .. dimensionNames.Select((name, index) =>
                    new ModelDimension(CodeOf(name), name, index + 1, active: true)),
            ],
            Author,
            atUtc);

        // Un driver por dimensión: es lo que el modelo de hoy es en realidad —un
        // puntaje por dimensión que alimenta el mismo total.
        version.ReplaceDrivers(
            [
                .. dimensionNames.Select(name => new ModelDriver(
                    CodeOf(name),
                    name,
                    [EstimationOutput.Size, EstimationOutput.Effort])),
            ],
            Author,
            atUtc);

        version.ReplaceQuestions(
            [.. questions.Select((question, index) => ToQuestion(question, index))],
            Author,
            atUtc);

        version.ReplaceTriage(
            [
                .. EvaluationModelCatalog.Triage.Select((triage, index) =>
                    new ModelTriageQuestion(index, triage.Id, triage.Text, triage.Critical)),
            ],
            Author,
            atUtc);

        List<TallaBand> orderedBands = [.. bands.Bands.OrderBy(b => b.Position)];

        version.ReplaceTallaRules(
            [.. bands.Boundaries],
            [.. orderedBands.Select((band, index) => ToTallaRule(band, index))],
            Author,
            atUtc);

        version.ReplaceRiskBands(
            [
                .. InitialRiskBands.Select((band, index) =>
                    new ModelRiskBand(index, band.Level, band.MaxPct)),
            ],
            Author,
            atUtc);

        version.ReplaceMix(
            ToPercentageMix(mix, [.. orderedBands.Select(b => b.Talla)]),
            Author,
            atUtc);

        // Hoy no hay modificadores: el mix depende sólo de la talla.
        version.ReplaceMixModifiers([], Author, atUtc);

        model.AdoptAsCurrent(version.Number, effectiveFrom, Note, Author, atUtc);
        return model;
    }

    private static ModelQuestion ToQuestion(PoolQuestion question, int position)
    {
        (_, IReadOnlyList<string> scale) = EvaluationModelCatalog.KindOf(question.Code);

        // Todas quedan evaluativas, incluidas las seis que el catálogo marca
        // como objetivas: hoy quien responde elige un tramo de una lista, no
        // escribe un número. La cuantitativa es capacidad nueva del modelo, y
        // convertir una etiqueta como «3–5» en un tramo real es una decisión de
        // calibración que le toca a la versión siguiente, no a la migración.
        return new ModelQuestion(
            position: position,
            code: question.Code,
            dimensionCode: CodeOf(question.Dimension.Value),
            texto: question.Texto,
            type: EstimationQuestionType.Evaluativa,
            unit: null,
            driverCode: CodeOf(question.Dimension.Value),
            active: true,
            options:
            [
                .. scale.Select((label, index) =>
                    new ModelQuestionOption(index, label, NormalizedScores[index], null, null)),
            ],
            weights: new Dictionary<EstimationOutput, decimal>
            {
                // El puntaje único de hoy decide talla y persona-mes a la vez.
                [EstimationOutput.Size] = question.Peso,
                [EstimationOutput.Effort] = question.Peso,
            });
    }

    private static ModelTallaRule ToTallaRule(TallaBand band, int position) => new(
        position: position,
        talla: band.Talla,
        pmMin: band.PmMin,
        // El punto medio es lo que el motor de hoy calcula. Deja de ser una
        // fórmula y pasa a ser un parámetro que se puede recalibrar.
        pmExpected: Math.Round((band.PmMin + band.PmMax) / 2m, 2, MidpointRounding.AwayFromZero),
        pmMax: band.PmMax,
        lectura: band.Lectura,
        // Una talla que Admin renombró no tiene acción en el catálogo. La regla
        // exige una, así que se dice que falta en vez de guardarla vacía.
        action: EvaluationModelCatalog.ActionFor(band.Talla) is { Length: > 0 } action
            ? action
            : "Sin acción recomendada declarada.");

    /// <summary>
    /// Convierte cantidades de personas por talla en porcentajes que suman
    /// exactamente 100 por columna. Reparte el resto por mayor residuo: dividir
    /// y redondear cada fila por su cuenta deja columnas en 99,99 o en 100,01, y
    /// una columna que no cierra bloquea la publicación.
    /// </summary>
    private static List<ModelMixRow> ToPercentageMix(CapabilityMix mix, IReadOnlyList<string> tallas)
    {
        List<CapabilityMixRow> rows = [.. mix.Rows.OrderBy(r => r.Position)];
        var percentages = rows.ToDictionary(
            r => r.Key,
            _ => new Dictionary<string, decimal>(StringComparer.Ordinal),
            StringComparer.Ordinal);

        foreach (string talla in tallas)
        {
            int total = rows.Sum(r => r.PorTalla.GetValueOrDefault(talla, 0));
            if (total == 0)
            {
                foreach (CapabilityMixRow row in rows)
                {
                    percentages[row.Key][talla] = 0m;
                }

                continue;
            }

            var exact = rows.ToDictionary(
                r => r.Key,
                r => r.PorTalla.GetValueOrDefault(talla, 0) * 100m / total,
                StringComparer.Ordinal);

            var floored = exact.ToDictionary(
                pair => pair.Key,
                pair => Math.Floor(pair.Value * 100m) / 100m,
                StringComparer.Ordinal);

            decimal remainder = 100m - floored.Values.Sum();
            List<string> byRemainder =
            [
                .. exact
                    .OrderByDescending(pair => pair.Value - floored[pair.Key])
                    .ThenBy(pair => pair.Key, StringComparer.Ordinal)
                    .Select(pair => pair.Key),
            ];

            // El resto se reparte de a un centésimo, empezando por quien más
            // perdió al truncar.
            int index = 0;
            while (remainder >= 0.01m && byRemainder.Count > 0)
            {
                string key = byRemainder[index % byRemainder.Count];
                floored[key] += 0.01m;
                remainder -= 0.01m;
                index++;
            }

            foreach (CapabilityMixRow row in rows)
            {
                percentages[row.Key][talla] = floored[row.Key];
            }
        }

        return
        [
            .. rows.Select((row, index) =>
                new ModelMixRow(index, row.Key, row.Capacidad, percentages[row.Key])),
        ];
    }

    private static string CodeOf(string dimension) =>
        DimensionCodes.TryGetValue(dimension, out string? code)
            ? code
            : new string([.. dimension.Where(char.IsLetter).Take(3)]).ToUpperInvariant();
}
