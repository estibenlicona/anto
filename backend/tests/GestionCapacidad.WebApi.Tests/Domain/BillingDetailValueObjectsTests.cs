using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class BillingAdjustmentTests
{
    [Fact]
    public void Ctor_WithZeroAmount_Throws()
    {
        Assert.Throws<DomainException>(() => new BillingAdjustment(0, AdjustmentReason.Other, "nota"));
    }

    [Fact]
    public void Ctor_WithoutNote_DefaultsToEmpty()
    {
        var adjustment = new BillingAdjustment(100_000, AdjustmentReason.Overtime, null);

        Assert.Equal(string.Empty, adjustment.Note);
    }

    [Fact]
    public void Ctor_WithNegativeAmount_Succeeds()
    {
        var adjustment = new BillingAdjustment(-50_000, AdjustmentReason.Exit, "Salida a mitad de mes");

        Assert.Equal(-50_000, adjustment.Amount);
    }
}

public sealed class ImputationTests
{
    [Fact]
    public void Ctor_WithEmptyStrings_NormalizesToNull()
    {
        var imputation = new Imputation("", "  ", null, null, "CC-1", null, null);

        Assert.Null(imputation.CostObject);
        Assert.Null(imputation.Concept);
        Assert.Equal("CC-1", imputation.CostCenter);
    }
}

public sealed class PrefactureDocumentTests
{
    private static readonly Imputation SomeImputation = Imputation.Empty;

    [Fact]
    public void Ctor_WithEmptyNumber_Throws()
    {
        Assert.Throws<DomainException>(() =>
            new PrefactureDocument("", new DateOnly(2026, 9, 5), 100, Currency.Cop, SomeImputation));
    }

    [Fact]
    public void Ctor_WithZeroAmount_Throws()
    {
        Assert.Throws<DomainException>(() =>
            new PrefactureDocument("FE-1", new DateOnly(2026, 9, 5), 0, Currency.Cop, SomeImputation));
    }

    [Fact]
    public void Ctor_RoundsAmountToInteger()
    {
        var document = new PrefactureDocument("FE-1", new DateOnly(2026, 9, 5), 1000.6m, Currency.Cop, SomeImputation);

        Assert.Equal(1001, document.Amount);
    }
}

public sealed class ObjectionTests
{
    [Fact]
    public void Ctor_WithEmptyReason_Throws()
    {
        Assert.Throws<DomainException>(() => new Objection("", DateTime.UtcNow));
    }
}
