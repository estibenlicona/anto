using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BalanceSignalCalculatorTests
{
    private static BalanceInput Base() => new(
        HasIdentity: true,
        HasSprint: true,
        HasSufficientHistory: true,
        CommittedPoints: 22m,
        AvailableFte: 1.0m,
        OwnMedianPoints: 22m,
        OwnMedianPointsPerFte: 22m,
        ExecutionSealed: true,
        ExecutionMissing: false,
        CompletionRate: 90m,
        OwnMedianCompletionRate: 90m,
        CarryOverRate: 0m,
        OwnMedianCarryOverRate: 0m,
        UnplannedRate: 0m,
        ConcurrentInitiatives: 1,
        Wip: 2,
        OwnDeviationRate: 0m,
        SquadDeviationRate: null);

    [Fact]
    public void Balanceado_AllNeutral_YieldsUsual()
    {
        BalanceSignalResult result = BalanceSignalCalculator.Compute(Base());

        Assert.Equal(BalanceSignal.Usual, result.Signal);
        Assert.All(result.Evidences, e => Assert.NotEqual(EvidenceDirection.Over, e.Direction));
    }

    [Fact]
    public void UnaSolaEvidencia_NoBasta_StaysUsual()
    {
        // Único desvío: carry-over por encima del histórico, por debajo del umbral fuerte.
        BalanceInput input = Base() with { CarryOverRate = 15m, OwnMedianCarryOverRate = 0m };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.Usual, result.Signal);
        Assert.Contains(result.Evidences, e => e.Id == EvidenceId.CarryOver && e.Direction == EvidenceDirection.Over);
    }

    [Fact]
    public void UnaEvidenciaFuerte_YaEsAccionable()
    {
        // Demanda 60% por debajo del histórico: por encima del umbral fuerte (50%).
        BalanceInput input = Base() with
        {
            CommittedPoints = 8.8m,
            OwnMedianPoints = 22m,
            OwnMedianPointsPerFte = 22m,
        };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.PossibleUnderload, result.Signal);
    }

    [Fact]
    public void DosEvidenciasConcordantes_PossibleOverload()
    {
        // 28 SP contra histórico 22 (+27%, no fuerte, arrastra demandPerFte igual)
        // y cumplimiento cayó 20pp: tres evidencias de la misma familia, misma dirección.
        BalanceInput input = Base() with
        {
            CommittedPoints = 28m,
            OwnMedianPoints = 22m,
            OwnMedianPointsPerFte = 22m,
            CompletionRate = 70m,
            OwnMedianCompletionRate = 90m,
        };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.PossibleOverload, result.Signal);
        Assert.True(result.OverCount >= 2);
        Assert.Contains(result.Evidences, e => e.Id == EvidenceId.Completion && e.Direction == EvidenceDirection.Over);
    }

    [Fact]
    public void EvidenciasEnDireccionesOpuestas_CaeAUsual()
    {
        // Demanda cruda muy por encima, pero por FTE disponible (la persona tenía
        // el doble de capacidad) queda muy por debajo: demand y demandPerFte
        // discrepan de dirección.
        BalanceInput input = Base() with
        {
            CommittedPoints = 30m,
            OwnMedianPoints = 20m,
            AvailableFte = 2.0m,
            OwnMedianPointsPerFte = 25m,
        };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.Usual, result.Signal);
        Assert.True(result.OverCount > 0 && result.UnderCount > 0);
    }

    [Fact]
    public void CompletionSinSellar_OnlyEvaluatesTheHundredPercentCase()
    {
        BalanceInput dropping = Base() with { ExecutionSealed = false, CompletionRate = 40m, OwnMedianCompletionRate = 90m };
        BalanceInput full = Base() with
        {
            ExecutionSealed = false,
            CompletionRate = 100m,
            OwnMedianCompletionRate = 90m,
            CommittedPoints = 8m,
            OwnMedianPoints = 22m,
            OwnMedianPointsPerFte = 22m,
        };

        BalanceEvidence droppingCompletion = BalanceSignalCalculator.Compute(dropping).Evidences
            .Single(e => e.Id == EvidenceId.Completion);
        BalanceEvidence fullCompletion = BalanceSignalCalculator.Compute(full).Evidences
            .Single(e => e.Id == EvidenceId.Completion);

        Assert.Equal(EvidenceDirection.Unknown, droppingCompletion.Direction);
        Assert.Equal(EvidenceDirection.Under, fullCompletion.Direction);
    }

    [Fact]
    public void SquadContext_SameDirection_DoesNotChangeTheSignal()
    {
        BalanceInput input = Base() with
        {
            CommittedPoints = 9m,
            OwnMedianPoints = 22m,
            OwnMedianPointsPerFte = 22m,
            OwnDeviationRate = -59.1m,
            SquadDeviationRate = -55m,
        };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.PossibleUnderload, result.Signal);
        Assert.Equal(SquadContext.SameDirection, result.SquadContext);
    }

    [Fact]
    public void NotEvaluable_ReportsTheReason_ButStillCarriesEvidences()
    {
        BalanceInput input = Base() with { HasIdentity = false };

        BalanceSignalResult result = BalanceSignalCalculator.Compute(input);

        Assert.Equal(BalanceSignal.NotEvaluable, result.Signal);
        Assert.Equal(NotEvaluableReason.NoIdentity, result.NotEvaluableReason);
        Assert.NotEmpty(result.Evidences);
    }

    [Fact]
    public void ResolveSquadContext_WithoutSquad_ReturnsNoSquad()
    {
        Assert.Equal(SquadContext.NoSquad, BalanceSignalCalculator.ResolveSquadContext(-10m, null));
    }
}
