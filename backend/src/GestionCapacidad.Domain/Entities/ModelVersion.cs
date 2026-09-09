using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una versión del modelo de estimación: su estado, su vigencia y todo su
/// contenido —dimensiones, preguntas con sus opciones, drivers, pesos por
/// salida, reglas de talla, bandas de riesgo, mix y modificadores— como un todo
/// indivisible.
///
/// Es el agregado en el que se trabaja, y no cuatro agregados de fila única con
/// una columna de versión, porque publicar tendría que escribir cuatro tablas
/// en una transacción para que la versión quedara completa; si una fallara,
/// quedaría una versión a medio copiar indistinguible de una entera, y el motor
/// la leería igual. Acá una versión incompleta no existe (design.md — D1).
///
/// **Sólo un borrador se edita.** La regla vive acá y no en los permisos: el
/// que reescribiría una versión vigente es justamente un administrador
/// legítimo, y lo que hay que hacer cumplir no es quién sino cuándo
/// (design.md — D2). Que sea inmutable es también lo que permite que una
/// estimación la referencie en vez de copiar su contenido (design.md — D3).
/// </summary>
public sealed class ModelVersion : Entity
{
    /// <summary>Ninguna talla puede quedar más angosta que esto, en puntos de porcentaje.</summary>
    public const decimal MinTallaWidth = 5m;

    public const decimal RangeMin = 0m;
    public const decimal RangeMax = 100m;

    public const string SectionDimensions = "dimensiones";
    public const string SectionDrivers = "drivers";
    public const string SectionTallas = "tallas";
    public const string SectionMix = "mix";
    public const string SectionPublish = "publicar";

    private readonly List<ModelDimension> _dimensions = [];
    private readonly List<ModelDriver> _drivers = [];
    private readonly List<ModelQuestion> _questions = [];
    private readonly List<ModelTriageQuestion> _triageQuestions = [];
    private readonly List<ModelTallaRule> _tallaRules = [];
    private readonly List<ModelRiskBand> _riskBands = [];
    private readonly List<ModelMixRow> _mix = [];
    private readonly List<MixModifier> _mixModifiers = [];
    private readonly List<ModelChangeEntry> _history = [];
    private List<decimal> _tallaBoundaries = [];

    private ModelVersion()
    {
    }

    public ModelVersion(int number, string createdBy, DateTime createdAtUtc)
    {
        if (number < 1)
        {
            throw new DomainException("El número de versión debe ser mayor o igual a 1.");
        }

        Number = number;
        Status = ModelVersionStatus.Borrador;
        _history.Add(new ModelChangeEntry(createdAtUtc, createdBy, SectionPublish, $"Se creó la versión {number}."));
    }

    public int Number { get; private set; }

    public ModelVersionStatus Status { get; private set; } = ModelVersionStatus.Borrador;

    /// <summary>Desde cuándo rige. Nulo mientras es borrador.</summary>
    public DateOnly? EffectiveFrom { get; private set; }

    /// <summary>Hasta cuándo rigió. Se llena al archivarla.</summary>
    public DateOnly? EffectiveTo { get; private set; }

    /// <summary>La nota con la que se publicó: por qué cambió el modelo.</summary>
    public string? ChangeNote { get; private set; }

    /// <summary>
    /// Los cortes interiores de porcentaje entre tallas, en orden creciente. Se
    /// guarda un número por frontera y no un mínimo y un máximo por talla
    /// porque con dos números por talla cada capa tendría la oportunidad de
    /// dejar un hueco o un solape; con la frontera compartida no hay dos
    /// números que puedan discrepar. 0 y 100 cierran el rango y no se guardan.
    /// </summary>
    public IReadOnlyList<decimal> TallaBoundaries => _tallaBoundaries.AsReadOnly();

    public IReadOnlyList<ModelDimension> Dimensions => _dimensions.AsReadOnly();

    public IReadOnlyList<ModelDriver> Drivers => _drivers.AsReadOnly();

    public IReadOnlyList<ModelQuestion> Questions => _questions.AsReadOnly();

    public IReadOnlyList<ModelTriageQuestion> TriageQuestions => _triageQuestions.AsReadOnly();

    public IReadOnlyList<ModelTallaRule> TallaRules => _tallaRules.AsReadOnly();

    public IReadOnlyList<ModelRiskBand> RiskBands => _riskBands.AsReadOnly();

    public IReadOnlyList<ModelMixRow> Mix => _mix.AsReadOnly();

    public IReadOnlyList<MixModifier> MixModifiers => _mixModifiers.AsReadOnly();

    /// <summary>El historial, de la entrada más vieja a la más nueva.</summary>
    public IReadOnlyList<ModelChangeEntry> History => _history.AsReadOnly();

    /// <summary>El porcentaje desde el que empieza una talla, según los cortes.</summary>
    public decimal MinPctOf(ModelTallaRule rule) =>
        rule.Position == 0 ? RangeMin : _tallaBoundaries[rule.Position - 1];

    /// <summary>El porcentaje hasta el que llega una talla, según los cortes.</summary>
    public decimal MaxPctOf(ModelTallaRule rule) =>
        rule.Position >= _tallaBoundaries.Count ? RangeMax : _tallaBoundaries[rule.Position];

    public void ReplaceDimensions(IReadOnlyList<ModelDimension> dimensions, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(dimensions);
        EnsureDraft();
        EnsureUnique(dimensions.Select(d => d.Code), "dimensión");

        _dimensions.Clear();
        _dimensions.AddRange(dimensions.OrderBy(d => d.Order));
        Record(author, atUtc, SectionDimensions, $"Se guardaron {dimensions.Count} dimensiones.");
    }

    public void ReplaceQuestions(IReadOnlyList<ModelQuestion> questions, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(questions);
        EnsureDraft();
        EnsureUnique(questions.Select(q => q.Code), "pregunta");

        _questions.Clear();
        _questions.AddRange(questions.OrderBy(q => q.Position));
        Record(author, atUtc, SectionDimensions, $"Se guardaron {questions.Count} preguntas.");
    }

    public void ReplaceTriage(IReadOnlyList<ModelTriageQuestion> triage, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(triage);
        EnsureDraft();
        EnsureUnique(triage.Select(t => t.Code), "pregunta de tamizaje");

        _triageQuestions.Clear();
        _triageQuestions.AddRange(triage.OrderBy(t => t.Position));
        Record(author, atUtc, SectionDimensions, $"Se guardaron {triage.Count} preguntas de tamizaje.");
    }

    public void ReplaceDrivers(IReadOnlyList<ModelDriver> drivers, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(drivers);
        EnsureDraft();
        EnsureUnique(drivers.Select(d => d.Code), "driver");

        _drivers.Clear();
        _drivers.AddRange(drivers);
        Record(author, atUtc, SectionDrivers, $"Se guardaron {drivers.Count} drivers.");
    }

    /// <summary>
    /// Reemplaza la fila de pesos de una pregunta. La matriz se edita por fila y
    /// no reenviando todas las preguntas para que guardar un peso no pueda
    /// pisar, de paso, un texto que alguien más estaba editando.
    /// </summary>
    public void SetQuestionWeights(
        string questionCode,
        IReadOnlyDictionary<EstimationOutput, decimal> weights,
        string author,
        DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(weights);
        EnsureDraft();

        int index = _questions.FindIndex(q => string.Equals(q.Code, questionCode, StringComparison.Ordinal));
        if (index < 0)
        {
            throw new DomainException($"La versión {Number} no tiene la pregunta {questionCode}.");
        }

        _questions[index] = _questions[index].WithWeights(weights);
        Record(author, atUtc, SectionDrivers, $"Se guardaron los pesos de la pregunta {questionCode}.");
    }

    public void ReplaceTallaRules(
        IReadOnlyList<decimal> boundaries,
        IReadOnlyList<ModelTallaRule> rules,
        string author,
        DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(boundaries);
        ArgumentNullException.ThrowIfNull(rules);
        EnsureDraft();
        EnsureUnique(rules.Select(r => r.Talla), "talla");
        ValidateBoundaries(boundaries, rules.Count);

        _tallaBoundaries = [.. boundaries];
        _tallaRules.Clear();
        _tallaRules.AddRange(rules.OrderBy(r => r.Position));
        Record(author, atUtc, SectionTallas, $"Se guardaron {rules.Count} reglas de talla.");
    }

    public void ReplaceRiskBands(IReadOnlyList<ModelRiskBand> bands, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(bands);
        EnsureDraft();
        EnsureUnique(bands.Select(b => b.Level), "banda de riesgo");

        _riskBands.Clear();
        _riskBands.AddRange(bands.OrderBy(b => b.Position));
        Record(author, atUtc, SectionTallas, $"Se guardaron {bands.Count} bandas de riesgo.");
    }

    public void ReplaceMix(IReadOnlyList<ModelMixRow> mix, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(mix);
        EnsureDraft();
        EnsureUnique(mix.Select(m => m.Key), "capacidad");

        _mix.Clear();
        _mix.AddRange(mix.OrderBy(m => m.Position));
        Record(author, atUtc, SectionMix, $"Se guardaron {mix.Count} capacidades del mix.");
    }

    public void ReplaceMixModifiers(IReadOnlyList<MixModifier> modifiers, string author, DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(modifiers);
        EnsureDraft();
        EnsureUnique(modifiers.Select(m => m.Code), "modificador");

        _mixModifiers.Clear();
        _mixModifiers.AddRange(modifiers.OrderBy(m => m.Position));
        Record(author, atUtc, SectionMix, $"Se guardaron {modifiers.Count} modificadores de mix.");
    }

    /// <summary>Copia todo el contenido de esta versión sobre un borrador nuevo.</summary>
    public void CopyContentTo(ModelVersion draft)
    {
        ArgumentNullException.ThrowIfNull(draft);
        draft.EnsureDraft();

        draft._dimensions.Clear();
        draft._dimensions.AddRange(_dimensions);
        draft._drivers.Clear();
        draft._drivers.AddRange(_drivers);
        draft._questions.Clear();
        draft._questions.AddRange(_questions);
        draft._triageQuestions.Clear();
        draft._triageQuestions.AddRange(_triageQuestions);
        draft._tallaBoundaries = [.. _tallaBoundaries];
        draft._tallaRules.Clear();
        draft._tallaRules.AddRange(_tallaRules);
        draft._riskBands.Clear();
        draft._riskBands.AddRange(_riskBands);
        draft._mix.Clear();
        draft._mix.AddRange(_mix);
        draft._mixModifiers.Clear();
        draft._mixModifiers.AddRange(_mixModifiers);
    }

    /// <summary>El puntaje de un driver: el promedio de sus preguntas activas ponderado por su peso en el mix.</summary>
    public IReadOnlyList<ModelQuestion> ActiveQuestions()
    {
        var activeDimensions = _dimensions
            .Where(d => d.Active)
            .Select(d => d.Code)
            .ToHashSet(StringComparer.Ordinal);

        return [.. _questions.Where(q => q.Active && activeDimensions.Contains(q.DimensionCode))];
    }

    internal void MarkCurrent(DateOnly effectiveFrom, string note, string author, DateTime atUtc)
    {
        EnsureDraft();

        if (string.IsNullOrWhiteSpace(note))
        {
            throw new DomainException("Publicar una versión exige decir qué cambió.");
        }

        Status = ModelVersionStatus.Vigente;
        EffectiveFrom = effectiveFrom;
        ChangeNote = note.Trim();
        MarkUpdated();
        _history.Add(new ModelChangeEntry(atUtc, author, SectionPublish, $"Se publicó la versión {Number}: {note.Trim()}"));
    }

    internal void Archive(DateOnly effectiveTo, string author, DateTime atUtc)
    {
        if (!Status.IsCurrent)
        {
            throw new DomainException($"Sólo se archiva la versión vigente; la {Number} está {Status}.");
        }

        Status = ModelVersionStatus.Archivada;
        EffectiveTo = effectiveTo;
        MarkUpdated();
        _history.Add(new ModelChangeEntry(atUtc, author, SectionPublish, $"Se archivó la versión {Number}."));
    }

    private void Record(string author, DateTime atUtc, string section, string summary)
    {
        _history.Add(new ModelChangeEntry(atUtc, author, section, summary));
        MarkUpdated();
    }

    /// <summary>La puerta de la inmutabilidad: todo cambio pasa por acá.</summary>
    private void EnsureDraft()
    {
        if (!Status.IsDraft)
        {
            throw new DomainException(
                $"La versión {Number} está {Status} y no se edita. " +
                "Para cambiarla, se crea una versión nueva a partir de ella.");
        }
    }

    private static void EnsureUnique(IEnumerable<string> codes, string what)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (string code in codes)
        {
            if (!seen.Add(code))
            {
                throw new DomainException($"Se repite la {what}: {code}.");
            }
        }
    }

    private static void ValidateBoundaries(IReadOnlyList<decimal> boundaries, int ruleCount)
    {
        if (ruleCount < 2)
        {
            throw new DomainException("Un modelo necesita al menos dos tallas.");
        }

        if (boundaries.Count != ruleCount - 1)
        {
            throw new DomainException(
                $"Con {ruleCount} tallas hacen falta {ruleCount - 1} cortes de porcentaje. Llegaron {boundaries.Count}.");
        }

        decimal previous = RangeMin;
        for (int i = 0; i < boundaries.Count; i++)
        {
            decimal boundary = boundaries[i];
            decimal next = i == boundaries.Count - 1 ? RangeMax : boundaries[i + 1];

            if (boundary - previous < MinTallaWidth || next - boundary < MinTallaWidth)
            {
                throw new DomainException(
                    $"Los cortes deben ser crecientes y dejar al menos {MinTallaWidth:0.##} puntos entre tallas " +
                    $"y contra {RangeMin:0.##} y {RangeMax:0.##}.");
            }

            previous = boundary;
        }
    }
}
