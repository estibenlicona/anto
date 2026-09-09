using System.Globalization;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Estimation;

/// <summary>Qué le pasó a un elemento entre dos versiones.</summary>
public enum ModelDiffKind
{
    Added,
    Removed,
    Changed,
}

public sealed record ModelDiffEntry(
    string Section,
    string Item,
    ModelDiffKind Kind,
    string? Before,
    string? After);

/// <summary>
/// En qué difiere una versión de otra, agrupado por sección del editor.
///
/// Se compara por código y no por posición: mover una pregunta de lugar no es
/// un cambio de contenido, y si el diff lo contara como uno, reordenar el
/// cuestionario llenaría la lista de ruido y escondería lo que sí cambió.
/// </summary>
public static class ModelVersionDiff
{
    public static IReadOnlyList<ModelDiffEntry> Between(ModelVersion? before, ModelVersion after)
    {
        ArgumentNullException.ThrowIfNull(after);

        var entries = new List<ModelDiffEntry>();

        if (before is null)
        {
            // Sin versión con la que comparar, todo lo que hay es nuevo.
            entries.AddRange(after.Dimensions.Select(d =>
                Added(ModelVersion.SectionDimensions, $"Dimensión {d.Name}", Describe(d))));
            entries.AddRange(after.Questions.Select(q =>
                Added(ModelVersion.SectionDimensions, $"Pregunta {q.Code}", Describe(q))));
            entries.AddRange(after.Drivers.Select(d =>
                Added(ModelVersion.SectionDrivers, $"Driver {d.Code}", Describe(d))));
            entries.AddRange(after.TallaRules.Select(r =>
                Added(ModelVersion.SectionTallas, $"Talla {r.Talla}", Describe(r))));
            entries.AddRange(after.Mix.Select(m =>
                Added(ModelVersion.SectionMix, $"Capacidad {m.Capacidad}", Describe(m))));
            return entries;
        }

        Compare(entries, ModelVersion.SectionDimensions, "Dimensión",
            before.Dimensions, after.Dimensions, d => d.Code, d => d.Name, Describe);

        Compare(entries, ModelVersion.SectionDimensions, "Pregunta",
            before.Questions, after.Questions, q => q.Code, q => q.Code, Describe);

        Compare(entries, ModelVersion.SectionDimensions, "Tamizaje",
            before.TriageQuestions, after.TriageQuestions, t => t.Code, t => t.Code, Describe);

        Compare(entries, ModelVersion.SectionDrivers, "Driver",
            before.Drivers, after.Drivers, d => d.Code, d => d.Code, Describe);

        ComparePesos(entries, before, after);

        if (!before.TallaBoundaries.SequenceEqual(after.TallaBoundaries))
        {
            entries.Add(new ModelDiffEntry(
                ModelVersion.SectionTallas,
                "Cortes de porcentaje",
                ModelDiffKind.Changed,
                Join(before.TallaBoundaries),
                Join(after.TallaBoundaries)));
        }

        Compare(entries, ModelVersion.SectionTallas, "Talla",
            before.TallaRules, after.TallaRules, r => r.Talla, r => r.Talla, Describe);

        Compare(entries, ModelVersion.SectionTallas, "Riesgo",
            before.RiskBands, after.RiskBands, b => b.Level, b => b.Level, Describe);

        Compare(entries, ModelVersion.SectionMix, "Capacidad",
            before.Mix, after.Mix, m => m.Key, m => m.Capacidad, Describe);

        Compare(entries, ModelVersion.SectionMix, "Modificador",
            before.MixModifiers, after.MixModifiers, m => m.Code, m => m.Code, Describe);

        return entries;
    }

    private static void Compare<T>(
        List<ModelDiffEntry> entries,
        string section,
        string label,
        IReadOnlyList<T> before,
        IReadOnlyList<T> after,
        Func<T, string> key,
        Func<T, string> name,
        Func<T, string> describe)
    {
        var byKeyBefore = before.ToDictionary(key, item => item, StringComparer.Ordinal);
        var byKeyAfter = after.ToDictionary(key, item => item, StringComparer.Ordinal);

        foreach ((string code, T item) in byKeyAfter)
        {
            if (!byKeyBefore.TryGetValue(code, out T? previous))
            {
                entries.Add(Added(section, $"{label} {name(item)}", describe(item)));
                continue;
            }

            string was = describe(previous);
            string now = describe(item);
            if (!string.Equals(was, now, StringComparison.Ordinal))
            {
                entries.Add(new ModelDiffEntry(section, $"{label} {name(item)}", ModelDiffKind.Changed, was, now));
            }
        }

        foreach ((string code, T item) in byKeyBefore)
        {
            if (!byKeyAfter.ContainsKey(code))
            {
                entries.Add(new ModelDiffEntry(
                    section, $"{label} {name(item)}", ModelDiffKind.Removed, describe(item), null));
            }
        }
    }

    /// <summary>
    /// Los pesos se comparan aparte de la pregunta porque se editan en otra
    /// sección: mezclarlos haría que cambiar un peso apareciera como un cambio
    /// del cuestionario, y llevaría a arreglarlo al lugar equivocado.
    /// </summary>
    private static void ComparePesos(List<ModelDiffEntry> entries, ModelVersion before, ModelVersion after)
    {
        var beforeByCode = before.Questions.ToDictionary(q => q.Code, q => q.Weights, StringComparer.Ordinal);

        foreach (ModelQuestion question in after.Questions)
        {
            if (!beforeByCode.TryGetValue(question.Code, out IReadOnlyDictionary<EstimationOutput, decimal>? was))
            {
                continue;
            }

            string previous = DescribeWeights(was);
            string now = DescribeWeights(question.Weights);
            if (!string.Equals(previous, now, StringComparison.Ordinal))
            {
                entries.Add(new ModelDiffEntry(
                    ModelVersion.SectionDrivers,
                    $"Pesos de {question.Code}",
                    ModelDiffKind.Changed,
                    previous,
                    now));
            }
        }
    }

    private static ModelDiffEntry Added(string section, string item, string after) =>
        new(section, item, ModelDiffKind.Added, null, after);

    private static string Describe(ModelDimension d) =>
        $"{d.Name}, orden {d.Order}, {(d.Active ? "activa" : "inactiva")}";

    private static string Describe(ModelQuestion q) =>
        $"{q.Texto} · {q.Type} · dimensión {q.DimensionCode} · driver {q.DriverCode} · " +
        $"{(q.Active ? "activa" : "inactiva")} · opciones: {string.Join(" / ", q.Options.Select(o => o.Label))}";

    private static string Describe(ModelTriageQuestion t) =>
        $"{t.Texto}{(t.Critical ? " (crítica)" : string.Empty)}";

    private static string Describe(ModelDriver d) =>
        $"{d.Description} → {string.Join(", ", d.Outputs)}";

    private static string Describe(ModelTallaRule r) =>
        $"PM {Number(r.PmMin)}–{Number(r.PmExpected)}–{Number(r.PmMax)} · {r.Lectura} · {r.Action}";

    private static string Describe(ModelRiskBand b) => $"hasta {Number(b.MaxPct)}%";

    private static string Describe(ModelMixRow m) =>
        string.Join(", ", m.PorTalla.OrderBy(p => p.Key, StringComparer.Ordinal)
            .Select(p => $"{p.Key} {Number(p.Value)}%"));

    private static string Describe(MixModifier m) =>
        $"{m.DriverCode} {m.ConditionOperator} {Number(m.Threshold)} en {string.Join("/", m.Tallas)}: " +
        string.Join(", ", m.Adjustments.Select(a => $"{a.CapabilityKey} {Signed(a.Points)}"));

    /// <summary>Una salida ausente no se lista: eso es lo que significa "no aporta".</summary>
    private static string DescribeWeights(IReadOnlyDictionary<EstimationOutput, decimal> weights) =>
        weights.Count == 0
            ? "sin peso en ninguna salida"
            : string.Join(", ", weights.OrderBy(p => p.Key).Select(p => $"{p.Key} {Number(p.Value)}"));

    private static string Join(IReadOnlyList<decimal> values) =>
        string.Join(", ", values.Select(Number));

    private static string Number(decimal value) =>
        value.ToString("0.##", CultureInfo.InvariantCulture);

    private static string Signed(decimal value) =>
        value > 0 ? $"+{Number(value)}" : Number(value);
}
