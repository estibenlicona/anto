using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Dedication;

public sealed record BalanceEvidence(EvidenceId Id, EvidenceDirection Direction, decimal? Value, decimal? Threshold, bool Strong);

public sealed record BalanceSignalResult(
    BalanceSignal Signal,
    int OverCount,
    int UnderCount,
    SquadContext SquadContext,
    NotEvaluableReason? NotEvaluableReason,
    IReadOnlyList<BalanceEvidence> Evidences);

public sealed record BalanceInput(
    bool HasIdentity,
    bool HasSprint,
    /// <summary>Falso cuando faltan sprints sellados para el mínimo configurado.</summary>
    bool HasSufficientHistory,
    decimal CommittedPoints,
    decimal AvailableFte,
    decimal? OwnMedianPoints,
    decimal? OwnMedianPointsPerFte,
    /// <summary>Verdadero sólo cuando el sprint que se mira ya tiene snapshot sellado.</summary>
    bool ExecutionSealed,
    /// <summary>El sprint que se mira cerró sin snapshot — no es lo mismo que <c>!ExecutionSealed</c>.</summary>
    bool ExecutionMissing,
    decimal? CompletionRate,
    decimal? OwnMedianCompletionRate,
    decimal? CarryOverRate,
    decimal? OwnMedianCarryOverRate,
    decimal? UnplannedRate,
    int? ConcurrentInitiatives,
    int? Wip,
    decimal? OwnDeviationRate,
    decimal? SquadDeviationRate);

/// <summary>
/// La señal de balance: una señal, no una sentencia. Puerto literal de
/// <c>balanceSignal.ts</c> — los umbrales y la lógica de agregación viven
/// acá, con nombre, para que ajustarlos sea cambiar una constante.
/// </summary>
public static class BalanceSignalCalculator
{
    /// <summary>Desvío relativo de la demanda que empieza a contar, y el que es "fuerte".</summary>
    public const decimal DemandDeviationPct = 25m;
    public const decimal DemandDeviationStrongPct = 50m;

    /// <summary>Caída de cumplimiento frente al histórico, en puntos porcentuales.</summary>
    public const decimal CompletionDropPp = 15m;
    public const decimal CompletionDropStrongPp = 30m;

    /// <summary>Exceso de carry-over frente al histórico, en puntos porcentuales.</summary>
    public const decimal CarryOverExcessPp = 10m;
    public const decimal CarryOverExcessStrongPp = 25m;

    /// <summary>Proporción de trabajo que entró después del inicio del sprint.</summary>
    public const decimal UnplannedRatePct = 20m;
    public const decimal UnplannedRateStrongPct = 50m;

    /// <summary>Fragmentación de atención: épicas simultáneas y HUs a la vez en curso.</summary>
    public const int MultitaskingInitiatives = 3;
    public const int MultitaskingInitiativesStrong = 5;
    public const int MultitaskingWip = 4;
    public const int MultitaskingWipStrong = 6;

    /// <summary>Cuán parecidas deben ser las desviaciones del colaborador y de su célula para "se comporta igual".</summary>
    public const decimal SquadSameDirectionTolerancePp = 10m;

    /// <summary>Evidencias concordantes que hacen falta para una señal accionable, sin ser fuerte.</summary>
    public const int StrongMinEvidences = 2;

    private static BalanceEvidence Unknown(EvidenceId id) => new(id, EvidenceDirection.Unknown, null, null, false);

    /// <summary>
    /// Demanda contra el propio histórico. Separa el efecto de las ausencias
    /// del efecto de la carga cuando se aplica a SP por FTE disponible.
    /// </summary>
    private static BalanceEvidence EvaluateDeviation(EvidenceId id, decimal? current, decimal? reference)
    {
        if (current is null || reference is null || reference == 0m)
        {
            return Unknown(id);
        }

        decimal rate = ((current.Value - reference.Value) / reference.Value) * 100m;
        decimal magnitude = Math.Abs(rate);
        bool strong = magnitude >= DemandDeviationStrongPct;
        decimal value = Math.Round(rate, 1, MidpointRounding.AwayFromZero);

        if (rate > DemandDeviationPct)
        {
            return new BalanceEvidence(id, EvidenceDirection.Over, value, DemandDeviationPct, strong);
        }

        if (rate < -DemandDeviationPct)
        {
            return new BalanceEvidence(id, EvidenceDirection.Under, value, -DemandDeviationPct, strong);
        }

        return new BalanceEvidence(id, EvidenceDirection.Neutral, value, DemandDeviationPct, false);
    }

    /// <summary>
    /// Cumplimiento. Antes del cierre sólo la mitad de la evidencia existe:
    /// sin sellar, la caída no se evalúa y el 100 % sí — un 100 % con demanda
    /// normal es sencillamente un buen sprint.
    /// </summary>
    private static BalanceEvidence EvaluateCompletion(
        decimal? completionRate, decimal? reference, EvidenceDirection demandDirection, bool sealedSnapshot)
    {
        EvidenceId id = EvidenceId.Completion;
        if (completionRate is null || reference is null)
        {
            return Unknown(id);
        }

        if (!sealedSnapshot && completionRate < 100m)
        {
            return Unknown(id);
        }

        decimal dropPp = reference.Value - completionRate.Value;
        decimal value = Math.Round(completionRate.Value, 1, MidpointRounding.AwayFromZero);

        if (dropPp > CompletionDropPp)
        {
            return new BalanceEvidence(
                id, EvidenceDirection.Over,
                value,
                Math.Round(reference.Value - CompletionDropPp, 1, MidpointRounding.AwayFromZero),
                dropPp >= CompletionDropStrongPp);
        }

        if (completionRate >= 100m && demandDirection == EvidenceDirection.Under)
        {
            return new BalanceEvidence(id, EvidenceDirection.Under, value, 100m, false);
        }

        return new BalanceEvidence(
            id, EvidenceDirection.Neutral, value,
            Math.Round(reference.Value - CompletionDropPp, 1, MidpointRounding.AwayFromZero), false);
    }

    /// <summary>Carry-over. Sólo apunta a sobrecarga, y sólo existe al cierre.</summary>
    private static BalanceEvidence EvaluateCarryOver(decimal? carryOverRate, decimal? reference, bool sealedSnapshot)
    {
        EvidenceId id = EvidenceId.CarryOver;
        if (!sealedSnapshot)
        {
            return Unknown(id);
        }

        if (carryOverRate is null || reference is null)
        {
            return Unknown(id);
        }

        decimal excessPp = carryOverRate.Value - reference.Value;
        decimal value = Math.Round(carryOverRate.Value, 1, MidpointRounding.AwayFromZero);
        decimal threshold = Math.Round(reference.Value + CarryOverExcessPp, 1, MidpointRounding.AwayFromZero);

        if (excessPp > CarryOverExcessPp)
        {
            return new BalanceEvidence(id, EvidenceDirection.Over, value, threshold, excessPp >= CarryOverExcessStrongPp);
        }

        return new BalanceEvidence(id, EvidenceDirection.Neutral, value, threshold, false);
    }

    /// <summary>Trabajo no planificado. También sólo hacia sobrecarga.</summary>
    private static BalanceEvidence EvaluateUnplanned(decimal? unplannedRate)
    {
        EvidenceId id = EvidenceId.UnplannedWork;
        if (unplannedRate is null)
        {
            return Unknown(id);
        }

        decimal value = Math.Round(unplannedRate.Value, 1, MidpointRounding.AwayFromZero);
        if (unplannedRate > UnplannedRatePct)
        {
            return new BalanceEvidence(id, EvidenceDirection.Over, value, UnplannedRatePct, unplannedRate > UnplannedRateStrongPct);
        }

        return new BalanceEvidence(id, EvidenceDirection.Neutral, value, UnplannedRatePct, false);
    }

    /// <summary>Multitarea. 28 SP en una iniciativa y 28 SP en cuatro no cargan igual.</summary>
    private static BalanceEvidence EvaluateMultitasking(int? concurrentInitiatives, int? wip)
    {
        EvidenceId id = EvidenceId.Multitasking;
        if (concurrentInitiatives is null && wip is null)
        {
            return Unknown(id);
        }

        int initiatives = concurrentInitiatives ?? 0;
        bool over = initiatives >= MultitaskingInitiatives || (wip is not null && wip >= MultitaskingWip);
        bool strong = initiatives >= MultitaskingInitiativesStrong || (wip is not null && wip >= MultitaskingWipStrong);

        return new BalanceEvidence(
            id, over ? EvidenceDirection.Over : EvidenceDirection.Neutral,
            concurrentInitiatives, MultitaskingInitiatives, over && strong);
    }

    /// <summary>
    /// ¿La célula se desvía como el colaborador? Si sí, se anota — nunca
    /// descuenta una evidencia.
    /// </summary>
    public static SquadContext ResolveSquadContext(decimal? ownDeviationRate, decimal? squadDeviationRate)
    {
        if (squadDeviationRate is null || ownDeviationRate is null)
        {
            return SquadContext.NoSquad;
        }

        bool sameSign = (ownDeviationRate > 0 && squadDeviationRate > 0) || (ownDeviationRate < 0 && squadDeviationRate < 0);
        if (!sameSign)
        {
            return SquadContext.Different;
        }

        decimal gap = Math.Abs(ownDeviationRate.Value - squadDeviationRate.Value);
        return gap <= SquadSameDirectionTolerancePp ? SquadContext.SameDirection : SquadContext.Different;
    }

    /// <summary>
    /// De los conteos a la señal: 0, o 1 no fuerte → habitual; 1 fuerte o ≥2 →
    /// accionable en la dirección dominante; direcciones opuestas → habitual.
    /// </summary>
    private static BalanceSignal Aggregate(int overCount, int underCount, bool anyStrong)
    {
        bool mixed = overCount > 0 && underCount > 0;
        if (mixed)
        {
            return BalanceSignal.Usual;
        }

        int dominant = Math.Max(overCount, underCount);
        if (dominant == 0)
        {
            return BalanceSignal.Usual;
        }

        if (dominant < StrongMinEvidences && !anyStrong)
        {
            return BalanceSignal.Usual;
        }

        return overCount > 0 ? BalanceSignal.PossibleOverload : BalanceSignal.PossibleUnderload;
    }

    public static BalanceSignalResult Compute(BalanceInput input)
    {
        NotEvaluableReason? notEvaluableReason = null;
        if (!input.HasIdentity)
        {
            notEvaluableReason = NotEvaluableReason.NoIdentity;
        }
        else if (!input.HasSprint)
        {
            notEvaluableReason = NotEvaluableReason.NoSprint;
        }
        else if (input.ExecutionMissing)
        {
            notEvaluableReason = NotEvaluableReason.MissingSnapshot;
        }
        else if (!input.HasSufficientHistory)
        {
            notEvaluableReason = NotEvaluableReason.InsufficientHistory;
        }

        BalanceEvidence demand = EvaluateDeviation(EvidenceId.DemandVsOwnHistory, input.CommittedPoints, input.OwnMedianPoints);
        BalanceEvidence demandPerFte = EvaluateDeviation(
            EvidenceId.DemandPerAvailableFte,
            CapacityCalculator.PointsPerAvailableFte(input.CommittedPoints, input.AvailableFte),
            input.OwnMedianPointsPerFte);

        List<BalanceEvidence> evidences =
        [
            demand,
            demandPerFte,
            EvaluateCompletion(input.CompletionRate, input.OwnMedianCompletionRate, demand.Direction, input.ExecutionSealed),
            EvaluateCarryOver(input.CarryOverRate, input.OwnMedianCarryOverRate, input.ExecutionSealed),
            EvaluateUnplanned(input.UnplannedRate),
            EvaluateMultitasking(input.ConcurrentInitiatives, input.Wip),
        ];

        SquadContext squadContext = ResolveSquadContext(input.OwnDeviationRate, input.SquadDeviationRate);

        if (notEvaluableReason is not null)
        {
            return new BalanceSignalResult(BalanceSignal.NotEvaluable, 0, 0, squadContext, notEvaluableReason, evidences);
        }

        int overCount = evidences.Count(e => e.Direction == EvidenceDirection.Over);
        int underCount = evidences.Count(e => e.Direction == EvidenceDirection.Under);

        EvidenceDirection dominantDirection = overCount >= underCount ? EvidenceDirection.Over : EvidenceDirection.Under;
        bool anyStrong = evidences.Any(e => e.Strong && e.Direction == dominantDirection);

        return new BalanceSignalResult(
            Aggregate(overCount, underCount, anyStrong), overCount, underCount, squadContext, null, evidences);
    }
}
