using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BillingContextTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ICompanyRepository> _companies = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAbsenceRepository> _absences = new();

    private readonly Guid _providerId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private const string October = "2026-10";

    private BillingContextTests Have(
        IReadOnlyList<Person>? people = null,
        IReadOnlyList<Company>? companies = null,
        IReadOnlyList<Allocation>? allocations = null,
        IReadOnlyList<Squad>? squads = null,
        IReadOnlyList<Absence>? absences = null)
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(people ?? []);
        _companies.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(companies ?? []);
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(allocations ?? []);
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(squads ?? []);
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(absences ?? []);
        return this;
    }

    private Task<BillingContext> BuildAsync() =>
        BillingContext.BuildAsync(_people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object, CancellationToken.None);

    [Fact]
    public async Task ToDto_WithoutDiscountOrAdjustment_ExpectedEqualsMonthlyCost()
    {
        Have();
        BillingContext context = await BuildAsync();
        var prefacture = new Prefacture(Guid.NewGuid(), "Paula Ramírez", "Data Engineer", "Plataforma de Datos", _providerId, 6_000_000m, October);
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));

        PrefactureDto dto = context.ToDto(prefacture);

        Assert.Equal(6_000_000m, dto.Expected);
        Assert.Equal(0m, dto.Difference);
    }

    [Fact]
    public async Task ToDto_WithDiscountAndAdjustment_ComputesExpectedExactly()
    {
        var personId = Guid.NewGuid();
        var absence = new Absence(personId, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        absence.Approve();
        Have(absences: [absence]);
        BillingContext context = await BuildAsync();

        var prefacture = new Prefacture(personId, "Paula Ramírez", "Data Engineer", null, _providerId, 6_000_000m, October);
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        prefacture.SetAdjustment(new BillingAdjustment(100_000, AdjustmentReason.Overtime, null));

        PrefactureDto dto = context.ToDto(prefacture);

        int expectedDiscount = (int)Math.Round(6_000_000m * (3m / 22m), MidpointRounding.AwayFromZero);
        decimal expected = 6_000_000m - expectedDiscount + 100_000m;
        Assert.Equal(expected, dto.Expected);
        Assert.NotNull(dto.AbsenceDiscount);
    }

    [Fact]
    public async Task ToDto_WithoutPrefactured_DifferenceIsNull()
    {
        Have();
        BillingContext context = await BuildAsync();
        var prefacture = new Prefacture(Guid.NewGuid(), "Paula Ramírez", "Data Engineer", null, _providerId, 6_000_000m, October);

        PrefactureDto dto = context.ToDto(prefacture);

        Assert.Null(dto.Difference);
        Assert.Null(dto.Prefactured);
    }

    [Fact]
    public async Task ToDto_WhenApproved_UsesTheFrozenDiscount_NotALiveRecalculation()
    {
        var personId = Guid.NewGuid();
        Have();
        BillingContext context = await BuildAsync();
        var prefacture = new Prefacture(personId, "Paula Ramírez", "Data Engineer", null, _providerId, 6_000_000m, October);
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        var frozen = new AbsenceDiscount(3m, 300_000);
        prefacture.Approve(frozen, "nota", DateTime.UtcNow);

        PrefactureDto dto = context.ToDto(prefacture);

        Assert.Equal(300_000, dto.AbsenceDiscount!.Amount);
    }
}
