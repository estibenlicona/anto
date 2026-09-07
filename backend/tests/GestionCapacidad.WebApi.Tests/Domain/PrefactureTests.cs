using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PrefactureTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid ProviderId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    private static Prefacture NewPrefacture(string period = "2026-09", decimal monthlyCost = 6_000_000m) =>
        new(PersonId, "Paula Ramírez", "Data Engineer", "Plataforma de Datos", ProviderId, monthlyCost, period);

    private static PrefactureDocument NewDocument(decimal amount = 6_000_000m) =>
        new("FE-1", new DateOnly(2026, 9, 5), amount, Currency.Cop, Imputation.Empty);

    [Fact]
    public void Ctor_NacePending_WithTheGivenSnapshot()
    {
        Prefacture prefacture = NewPrefacture();

        Assert.Equal(BillingStatus.Pending, prefacture.Status);
        Assert.Equal("Paula Ramírez", prefacture.PersonName);
        Assert.Equal(6_000_000m, prefacture.MonthlyCost);
        Assert.Null(prefacture.Document);
        Assert.Null(prefacture.Prefactured);
    }

    [Theory]
    [InlineData("")]
    [InlineData("2026-9")]
    [InlineData("2026/09")]
    [InlineData("2026-13")]
    public void Ctor_WithInvalidPeriod_Throws(string period)
    {
        Assert.Throws<DomainException>(() => NewPrefacture(period));
    }

    [Fact]
    public void RegisterDocument_OnPending_LeavesReceived()
    {
        Prefacture prefacture = NewPrefacture();

        prefacture.RegisterDocument(NewDocument(6_100_000m));

        Assert.Equal(BillingStatus.Received, prefacture.Status);
        Assert.Equal(6_100_000, prefacture.Prefactured);
        Assert.NotNull(prefacture.Document);
    }

    [Fact]
    public void RegisterDocument_OnObjected_ReplacesDocument_AndReturnsToReceived_WithoutClearingTheObjection()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());
        prefacture.Object("Facturaron de más", DateTime.UtcNow);

        prefacture.RegisterDocument(NewDocument(5_900_000m));

        Assert.Equal(BillingStatus.Received, prefacture.Status);
        Assert.Equal(5_900_000, prefacture.Prefactured);
        Assert.NotNull(prefacture.Objection);
    }

    [Fact]
    public void RegisterDocument_WithAnExistingDocument_NotObjected_Throws()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());

        Assert.Throws<DomainException>(() => prefacture.RegisterDocument(NewDocument()));
    }

    [Fact]
    public void RegisterDocument_OnApproved_Throws()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());
        prefacture.Approve(discount: null, note: null, approvedAtUtc: DateTime.UtcNow);

        Assert.Throws<DomainException>(() => prefacture.RegisterDocument(NewDocument()));
    }

    [Fact]
    public void SetAdjustment_OnReceived_LeavesInReview()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());

        prefacture.SetAdjustment(new BillingAdjustment(100_000, AdjustmentReason.Overtime, "Turno extra"));

        Assert.Equal(BillingStatus.InReview, prefacture.Status);
    }

    [Fact]
    public void SetAdjustment_OnInReview_StaysInReview()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());
        prefacture.SetAdjustment(new BillingAdjustment(100_000, AdjustmentReason.Overtime, null));

        prefacture.ClearAdjustment();

        Assert.Equal(BillingStatus.InReview, prefacture.Status);
        Assert.Null(prefacture.Adjustment);
    }

    [Fact]
    public void SetAdjustment_OnApprovedOrObjected_Throws()
    {
        Prefacture approved = NewPrefacture();
        approved.RegisterDocument(NewDocument());
        approved.Approve(null, null, DateTime.UtcNow);
        Assert.Throws<DomainException>(() =>
            approved.SetAdjustment(new BillingAdjustment(1, AdjustmentReason.Other, null)));

        Prefacture objected = NewPrefacture();
        objected.RegisterDocument(NewDocument());
        objected.Object("motivo", DateTime.UtcNow);
        Assert.Throws<DomainException>(() =>
            objected.SetAdjustment(new BillingAdjustment(1, AdjustmentReason.Other, null)));
    }

    [Fact]
    public void SetPrefactured_WithoutDocument_Throws()
    {
        Prefacture prefacture = NewPrefacture();

        Assert.Throws<DomainException>(() => prefacture.SetPrefactured(100));
    }

    [Fact]
    public void Approve_WithZeroDifference_WithoutNote_Succeeds()
    {
        Prefacture prefacture = NewPrefacture(monthlyCost: 6_000_000m);
        prefacture.RegisterDocument(NewDocument(6_000_000m));

        prefacture.Approve(discount: null, note: null, approvedAtUtc: DateTime.UtcNow);

        Assert.Equal(BillingStatus.Approved, prefacture.Status);
        Assert.Null(prefacture.ApprovalNote);
    }

    [Fact]
    public void Approve_WithNonZeroDifference_WithoutNote_Throws()
    {
        Prefacture prefacture = NewPrefacture(monthlyCost: 6_000_000m);
        prefacture.RegisterDocument(NewDocument(6_500_000m));

        Assert.Throws<DomainException>(() => prefacture.Approve(null, null, DateTime.UtcNow));
    }

    [Fact]
    public void Approve_WithNonZeroDifference_WithNote_Succeeds_AndFreezesTheDiscount()
    {
        Prefacture prefacture = NewPrefacture(monthlyCost: 6_000_000m);
        prefacture.RegisterDocument(NewDocument(6_500_000m));
        var discount = new AbsenceDiscount(3m, 300_000);

        prefacture.Approve(discount, "Se aprueba con nota", DateTime.UtcNow);

        Assert.Equal(BillingStatus.Approved, prefacture.Status);
        Assert.Equal("Se aprueba con nota", prefacture.ApprovalNote);
        Assert.Equal(discount, prefacture.FrozenDiscount);
    }

    [Fact]
    public void Object_WithoutReason_Throws()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(NewDocument());

        Assert.Throws<DomainException>(() => prefacture.Object("", DateTime.UtcNow));
    }

    [Fact]
    public void ApproveOrObject_FromPendingOrObjectedOrApproved_Throws()
    {
        Prefacture pending = NewPrefacture();
        Assert.Throws<DomainException>(() => pending.Approve(null, null, DateTime.UtcNow));
        Assert.Throws<DomainException>(() => pending.Object("motivo", DateTime.UtcNow));

        Prefacture objected = NewPrefacture();
        objected.RegisterDocument(NewDocument());
        objected.Object("motivo", DateTime.UtcNow);
        Assert.Throws<DomainException>(() => objected.Approve(null, null, DateTime.UtcNow));
        Assert.Throws<DomainException>(() => objected.Object("otro motivo", DateTime.UtcNow));

        Prefacture approved = NewPrefacture();
        approved.RegisterDocument(NewDocument());
        approved.Approve(null, null, DateTime.UtcNow);
        Assert.Throws<DomainException>(() => approved.Object("motivo", DateTime.UtcNow));
    }
}
