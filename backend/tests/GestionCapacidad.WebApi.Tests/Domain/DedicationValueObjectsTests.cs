using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SnapshotStatusTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(["Sealed", "Provisional", "Missing"], SnapshotStatus.ValidValues.Select(v => v.Value));
}

public sealed class BalanceSignalValueObjectTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(
            ["Usual", "PossibleOverload", "PossibleUnderload", "NotEvaluable"],
            BalanceSignal.ValidValues.Select(v => v.Value));
}

public sealed class SquadContextTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(["SameDirection", "Different", "NoSquad"], SquadContext.ValidValues.Select(v => v.Value));
}

public sealed class NotEvaluableReasonTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(
            ["NoIdentity", "NoSprint", "MissingSnapshot", "InsufficientHistory"],
            NotEvaluableReason.ValidValues.Select(v => v.Value));
}

public sealed class EvidenceIdTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(
            ["demandVsOwnHistory", "demandPerAvailableFte", "completion", "carryOver", "unplannedWork", "multitasking"],
            EvidenceId.ValidValues.Select(v => v.Value));
}

public sealed class EvidenceDirectionTests
{
    [Fact]
    public void ValidValues_AreInContractOrder() =>
        Assert.Equal(["Over", "Under", "Neutral", "Unknown"], EvidenceDirection.ValidValues.Select(v => v.Value));
}
