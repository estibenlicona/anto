using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class BillingStatusTests
{
    [Theory]
    [InlineData("Pending", "Pendiente")]
    [InlineData("Received", "Recibida")]
    [InlineData("InReview", "En revisión")]
    [InlineData("Approved", "Aprobada")]
    [InlineData("Objected", "Objetada")]
    public void From_WithValidSlug_ReturnsStatusWithSpanishLabel(string value, string label)
    {
        BillingStatus status = BillingStatus.From(value);

        Assert.Equal(value, status.Value);
        Assert.Equal(label, status.Label);
    }

    [Fact]
    public void ValidValues_AreTheFiveOfTheContract_InOrder()
    {
        Assert.Equal(
            ["Pending", "Received", "InReview", "Approved", "Objected"],
            BillingStatus.ValidValues.Select(s => s.Value));
    }

    [Fact]
    public void IsReviewable_OnlyReceivedAndInReview()
    {
        Assert.True(BillingStatus.Received.IsReviewable);
        Assert.True(BillingStatus.InReview.IsReviewable);
        Assert.False(BillingStatus.Pending.IsReviewable);
        Assert.False(BillingStatus.Approved.IsReviewable);
        Assert.False(BillingStatus.Objected.IsReviewable);
    }

    [Theory]
    [InlineData("")]
    [InlineData("pending")]
    [InlineData("None")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => BillingStatus.From(value));

        Assert.Contains("Pending", exception.Message);
        Assert.Contains("Objected", exception.Message);
    }
}

public sealed class AdjustmentReasonTests
{
    [Fact]
    public void ValidValues_AreTheFourOfTheContract_InOrder()
    {
        Assert.Equal(
            ["Overtime", "PartialEntry", "Exit", "Other"],
            AdjustmentReason.ValidValues.Select(r => r.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("overtime")]
    [InlineData("Bonus")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => AdjustmentReason.From(value));

        Assert.Contains("Overtime", exception.Message);
        Assert.Contains("Other", exception.Message);
    }
}

public sealed class CurrencyTests
{
    [Fact]
    public void From_Cop_Succeeds()
    {
        Assert.Equal("COP", Currency.From("COP").Value);
    }

    [Theory]
    [InlineData("")]
    [InlineData("USD")]
    [InlineData("cop")]
    public void From_AnythingElse_Throws(string value)
    {
        Assert.Throws<DomainException>(() => Currency.From(value));
    }
}
