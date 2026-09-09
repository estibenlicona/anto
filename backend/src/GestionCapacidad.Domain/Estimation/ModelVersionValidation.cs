using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Estimation;

/// <summary>En qué quedó un chequeo de la validación.</summary>
public enum ModelCheckStatus
{
    /// <summary>Pasa.</summary>
    Passed,

    /// <summary>Algo que conviene mirar, pero que no bloquea la publicación.</summary>
    Warning,

    /// <summary>Un impedimento: con uno solo, la versión no se publica.</summary>
    Failed,
}

/// <summary>
/// El resultado de un chequeo. <see cref="Missing"/> dice qué falta y
/// <see cref="Section"/> a qué sección del editor lleva la acción de arreglarlo:
/// un impedimento que no dice dónde se corrige obliga a buscar a mano.
/// </summary>
public sealed record ModelValidationCheck(
    string Code,
    string Title,
    ModelCheckStatus Status,
    string? Missing,
    string Section);

public sealed record ModelValidationReport(IReadOnlyList<ModelValidationCheck> Checks)
{
    public IReadOnlyList<ModelValidationCheck> Impediments =>
        [.. Checks.Where(c => c.Status is ModelCheckStatus.Failed)];

    public IReadOnlyList<ModelValidationCheck> Warnings =>
        [.. Checks.Where(c => c.Status is ModelCheckStatus.Warning)];

    public bool CanPublish => Impediments.Count == 0;
}

/// <summary>
/// Los nueve chequeos que una versión tiene que pasar para publicarse.
///
/// Es una función pura sobre el contenido de la versión, y no una validación de
/// borde con FluentValidation, porque lo que se valida no es lo que llegó por el
/// cable sino el **estado acumulado**: que las columnas del mix sumen 100, que
/// los cortes sean contiguos, que ninguna salida quede huérfana. Además la
/// pantalla necesita la misma lista para llevar a arreglar cada impedimento, y
/// duplicarla en el cliente la haría mentir apenas cambie una regla
/// (design.md — D6).
/// </summary>
public static class ModelVersionValidation
{
    public const string CheckDimensions = "DIMENSIONES";
    public const string CheckQuestions = "PREGUNTAS";
    public const string CheckDrivers = "DRIVERS";
    public const string CheckWeights = "PESOS";
    public const string CheckTallas = "TALLAS";
    public const string CheckEffort = "ESFUERZO";
    public const string CheckRisk = "RIESGO";
    public const string CheckMix = "MIX";
    public const string CheckModifiers = "MODIFICADORES";

    /// <summary>Las salidas que tienen que quedar alimentadas; el mix se valida aparte.</summary>
    private static readonly EstimationOutput[] ResultOutputs =
        [EstimationOutput.Size, EstimationOutput.Effort, EstimationOutput.Risk];

    public static ModelValidationReport Validate(ModelVersion version)
    {
        ArgumentNullException.ThrowIfNull(version);

        IReadOnlyList<ModelQuestion> active = version.ActiveQuestions();

        return new ModelValidationReport(
        [
            Dimensions(version, active),
            Questions(version, active),
            Drivers(version, active),
            Weights(active),
            Tallas(version),
            Effort(version),
            Risk(version),
            Mix(version),
            Modifiers(version),
        ]);
    }

    private static ModelValidationCheck Dimensions(ModelVersion version, IReadOnlyList<ModelQuestion> active)
    {
        List<ModelDimension> activeDimensions = [.. version.Dimensions.Where(d => d.Active)];

        if (activeDimensions.Count == 0)
        {
            return Failed(CheckDimensions, "Dimensiones activas", "No hay ninguna dimensión activa.", ModelVersion.SectionDimensions);
        }

        List<string> empty =
        [
            .. activeDimensions
                .Where(d => !active.Any(q => string.Equals(q.DimensionCode, d.Code, StringComparison.Ordinal)))
                .Select(d => d.Name),
        ];

        return empty.Count > 0
            ? Failed(
                CheckDimensions,
                "Dimensiones activas",
                $"Sin preguntas activas: {string.Join(", ", empty)}.",
                ModelVersion.SectionDimensions)
            : Passed(CheckDimensions, "Dimensiones activas", ModelVersion.SectionDimensions);
    }

    private static ModelValidationCheck Questions(ModelVersion version, IReadOnlyList<ModelQuestion> active)
    {
        if (active.Count == 0)
        {
            return Failed(CheckQuestions, "Preguntas del cuestionario", "No hay ninguna pregunta activa.", ModelVersion.SectionDimensions);
        }

        var declared = version.Dimensions.Select(d => d.Code).ToHashSet(StringComparer.Ordinal);

        List<string> orphan =
        [
            .. version.Questions
                .Where(q => q.Active && !declared.Contains(q.DimensionCode))
                .Select(q => q.Code),
        ];

        if (orphan.Count > 0)
        {
            return Failed(
                CheckQuestions,
                "Preguntas del cuestionario",
                $"Apuntan a una dimensión que no existe: {string.Join(", ", orphan)}.",
                ModelVersion.SectionDimensions);
        }

        List<string> withoutUnit =
        [
            .. active
                .Where(q => q.Type is EstimationQuestionType.Cuantitativa && string.IsNullOrWhiteSpace(q.Unit))
                .Select(q => q.Code),
        ];

        return withoutUnit.Count > 0
            ? Failed(
                CheckQuestions,
                "Preguntas del cuestionario",
                $"Cuantitativas sin unidad: {string.Join(", ", withoutUnit)}.",
                ModelVersion.SectionDimensions)
            : Passed(CheckQuestions, "Preguntas del cuestionario", ModelVersion.SectionDimensions);
    }

    private static ModelValidationCheck Drivers(ModelVersion version, IReadOnlyList<ModelQuestion> active)
    {
        if (version.Drivers.Count == 0)
        {
            return Failed(CheckDrivers, "Drivers", "No hay ningún driver definido.", ModelVersion.SectionDrivers);
        }

        var declared = version.Drivers.Select(d => d.Code).ToHashSet(StringComparer.Ordinal);

        List<string> unknown =
        [
            .. active.Where(q => !declared.Contains(q.DriverCode)).Select(q => q.Code),
        ];

        if (unknown.Count > 0)
        {
            return Failed(
                CheckDrivers,
                "Drivers",
                $"Apuntan a un driver que no existe: {string.Join(", ", unknown)}.",
                ModelVersion.SectionDrivers);
        }

        // Un driver sin preguntas queda huérfano: nada lo mueve, así que las
        // salidas sobre las que dice actuar no reciben nada de él.
        List<string> orphan =
        [
            .. version.Drivers
                .Where(d => !active.Any(q => string.Equals(q.DriverCode, d.Code, StringComparison.Ordinal)))
                .Select(d => d.Code),
        ];

        return orphan.Count > 0
            ? Failed(
                CheckDrivers,
                "Drivers",
                $"Sin preguntas activas que los alimenten: {string.Join(", ", orphan)}.",
                ModelVersion.SectionDrivers)
            : Passed(CheckDrivers, "Drivers", ModelVersion.SectionDrivers);
    }

    private static ModelValidationCheck Weights(IReadOnlyList<ModelQuestion> active)
    {
        List<string> starved =
        [
            .. ResultOutputs
                .Where(output => !active.Any(q => q.Weights.ContainsKey(output)))
                .Select(output => Label(output)),
        ];

        if (starved.Count > 0)
        {
            return Failed(
                CheckWeights,
                "Pesos por salida",
                $"Sin ninguna pregunta que aporte: {string.Join(", ", starved)}.",
                ModelVersion.SectionDrivers);
        }

        // Advertencia y no impedimento: una pregunta sin peso en ninguna salida
        // no rompe el cálculo, sólo le hace perder el tiempo a quien responde.
        List<string> inert = [.. active.Where(q => q.Weights.Count == 0).Select(q => q.Code)];

        return inert.Count > 0
            ? new ModelValidationCheck(
                CheckWeights,
                "Pesos por salida",
                ModelCheckStatus.Warning,
                $"No mueven ningún resultado: {string.Join(", ", inert)}.",
                ModelVersion.SectionDrivers)
            : Passed(CheckWeights, "Pesos por salida", ModelVersion.SectionDrivers);
    }

    private static ModelValidationCheck Tallas(ModelVersion version)
    {
        if (version.TallaRules.Count < 2)
        {
            return Failed(CheckTallas, "Reglas de talla", "Hacen falta al menos dos tallas.", ModelVersion.SectionTallas);
        }

        if (version.TallaBoundaries.Count != version.TallaRules.Count - 1)
        {
            return Failed(
                CheckTallas,
                "Reglas de talla",
                $"Con {version.TallaRules.Count} tallas hacen falta {version.TallaRules.Count - 1} cortes; hay {version.TallaBoundaries.Count}.",
                ModelVersion.SectionTallas);
        }

        decimal previous = ModelVersion.RangeMin;
        for (int i = 0; i < version.TallaBoundaries.Count; i++)
        {
            decimal boundary = version.TallaBoundaries[i];
            decimal next = i == version.TallaBoundaries.Count - 1
                ? ModelVersion.RangeMax
                : version.TallaBoundaries[i + 1];

            if (boundary - previous < ModelVersion.MinTallaWidth || next - boundary < ModelVersion.MinTallaWidth)
            {
                return Failed(
                    CheckTallas,
                    "Reglas de talla",
                    $"El corte en {boundary:0.##} deja una talla más angosta que {ModelVersion.MinTallaWidth:0.##} puntos.",
                    ModelVersion.SectionTallas);
            }

            previous = boundary;
        }

        return Passed(CheckTallas, "Reglas de talla", ModelVersion.SectionTallas);
    }

    private static ModelValidationCheck Effort(ModelVersion version)
    {
        List<string> broken =
        [
            .. version.TallaRules
                .Where(r => r.PmMin > r.PmExpected || r.PmExpected > r.PmMax)
                .Select(r => r.Talla),
        ];

        return broken.Count > 0
            ? Failed(
                CheckEffort,
                "Parámetros de esfuerzo",
                $"El esperado queda fuera del rango en: {string.Join(", ", broken)}.",
                ModelVersion.SectionTallas)
            : Passed(CheckEffort, "Parámetros de esfuerzo", ModelVersion.SectionTallas);
    }

    private static ModelValidationCheck Risk(ModelVersion version)
    {
        if (version.RiskBands.Count == 0)
        {
            return Failed(CheckRisk, "Bandas de riesgo", "No hay ninguna banda de riesgo.", ModelVersion.SectionTallas);
        }

        List<ModelRiskBand> ordered = [.. version.RiskBands.OrderBy(b => b.Position)];

        for (int i = 1; i < ordered.Count; i++)
        {
            if (ordered[i].MaxPct <= ordered[i - 1].MaxPct)
            {
                return Failed(
                    CheckRisk,
                    "Bandas de riesgo",
                    $"El techo de «{ordered[i].Level}» no supera al de «{ordered[i - 1].Level}».",
                    ModelVersion.SectionTallas);
            }
        }

        return ordered[^1].MaxPct != ModelVersion.RangeMax
            ? Failed(
                CheckRisk,
                "Bandas de riesgo",
                $"La última banda llega a {ordered[^1].MaxPct:0.##} y tiene que llegar a 100.",
                ModelVersion.SectionTallas)
            : Passed(CheckRisk, "Bandas de riesgo", ModelVersion.SectionTallas);
    }

    private static ModelValidationCheck Mix(ModelVersion version)
    {
        if (version.Mix.Count == 0)
        {
            return Failed(CheckMix, "Mix de capacidades", "No hay ninguna capacidad en el mix.", ModelVersion.SectionMix);
        }

        var offBy = new List<string>();
        foreach (ModelTallaRule rule in version.TallaRules)
        {
            decimal total = version.Mix.Sum(m => m.For(rule.Talla));
            if (total != 100m)
            {
                decimal difference = total - 100m;
                offBy.Add(difference > 0
                    ? $"{rule.Talla} (sobran {difference:0.##})"
                    : $"{rule.Talla} (faltan {-difference:0.##})");
            }
        }

        return offBy.Count > 0
            ? Failed(
                CheckMix,
                "Mix de capacidades",
                $"No suman 100: {string.Join(", ", offBy)}.",
                ModelVersion.SectionMix)
            : Passed(CheckMix, "Mix de capacidades", ModelVersion.SectionMix);
    }

    private static ModelValidationCheck Modifiers(ModelVersion version)
    {
        var drivers = version.Drivers.Select(d => d.Code).ToHashSet(StringComparer.Ordinal);
        var capabilities = version.Mix.Select(m => m.Key).ToHashSet(StringComparer.Ordinal);

        foreach (MixModifier modifier in version.MixModifiers)
        {
            if (!drivers.Contains(modifier.DriverCode))
            {
                return Failed(
                    CheckModifiers,
                    "Modificadores de mix",
                    $"«{modifier.Code}» apunta al driver {modifier.DriverCode}, que no existe.",
                    ModelVersion.SectionMix);
            }

            foreach (MixAdjustment adjustment in modifier.Adjustments)
            {
                if (!capabilities.Contains(adjustment.CapabilityKey))
                {
                    return Failed(
                        CheckModifiers,
                        "Modificadores de mix",
                        $"«{modifier.Code}» ajusta {adjustment.CapabilityKey}, que no está en el mix.",
                        ModelVersion.SectionMix);
                }
            }

            // Que reparta no alcanza: restar diez puntos a un perfil que sólo
            // tiene cinco lo deja en negativo, y un porcentaje negativo no es
            // demanda de nada.
            foreach (string talla in modifier.Tallas)
            {
                foreach (MixAdjustment adjustment in modifier.Adjustments)
                {
                    ModelMixRow? row = version.Mix.FirstOrDefault(m =>
                        string.Equals(m.Key, adjustment.CapabilityKey, StringComparison.Ordinal));

                    if (row is not null && row.For(talla) + adjustment.Points < 0m)
                    {
                        return Failed(
                            CheckModifiers,
                            "Modificadores de mix",
                            $"«{modifier.Code}» deja a {row.Capacidad} por debajo de cero en la talla {talla}.",
                            ModelVersion.SectionMix);
                    }
                }
            }
        }

        return Passed(CheckModifiers, "Modificadores de mix", ModelVersion.SectionMix);
    }

    private static string Label(EstimationOutput output) => output switch
    {
        EstimationOutput.Size => "tamaño",
        EstimationOutput.Effort => "esfuerzo",
        EstimationOutput.Risk => "riesgo",
        _ => "mix",
    };

    private static ModelValidationCheck Passed(string code, string title, string section) =>
        new(code, title, ModelCheckStatus.Passed, null, section);

    private static ModelValidationCheck Failed(string code, string title, string missing, string section) =>
        new(code, title, ModelCheckStatus.Failed, missing, section);
}
