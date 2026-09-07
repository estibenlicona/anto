using GestionCapacidad.Application.Billing;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BillingDiscountCalculatorTests
{
    private readonly Mock<IAbsenceRepository> _absences = new();
    private readonly BillingDiscountCalculator _calculator;
    private readonly Person _paula = TestDataFactory.CreatePerson(name: "Paula Ramírez");

    // Octubre de 2026: 22 días hábiles.
    private const string October = "2026-10";

    public BillingDiscountCalculatorTests()
    {
        _calculator = new BillingDiscountCalculator(_absences.Object);
    }

    private void HaveAbsences(params Absence[] absences) =>
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(absences);

    [Fact]
    public async Task WithoutApprovedAbsences_ReturnsNull()
    {
        HaveAbsences();

        AbsenceDiscount? discount = await _calculator.CalculateAsync(_paula.Id, October, 6_000_000m);

        Assert.Null(discount);
    }

    [Fact]
    public async Task WithARequestedAbsenceThatTouchesThePeriod_DoesNotCount()
    {
        var absence = new Absence(_paula.Id, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        HaveAbsences(absence);

        AbsenceDiscount? discount = await _calculator.CalculateAsync(_paula.Id, October, 6_000_000m);

        Assert.Null(discount);
    }

    [Fact]
    public async Task WithARejectedAbsence_DoesNotCount()
    {
        var absence = new Absence(_paula.Id, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        absence.Reject("motivo");
        HaveAbsences(absence);

        AbsenceDiscount? discount = await _calculator.CalculateAsync(_paula.Id, October, 6_000_000m);

        Assert.Null(discount);
    }

    [Fact]
    public async Task WithAnApprovedAbsence_ThreeBusinessDaysOverATwentyTwoDayMonth_ComputesTheExactAmount()
    {
        // Lunes 5 a miércoles 7 de octubre 2026: 3 días hábiles.
        var absence = new Absence(_paula.Id, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        absence.Approve();
        HaveAbsences(absence);

        AbsenceDiscount? discount = await _calculator.CalculateAsync(_paula.Id, October, 6_000_000m);

        Assert.NotNull(discount);
        Assert.Equal(3m, discount!.BusinessDays);
        Assert.Equal((int)Math.Round(6_000_000m * (3m / 22m), MidpointRounding.AwayFromZero), discount.Amount);
    }

    [Fact]
    public async Task IgnoresApprovedAbsencesOfOtherPeople()
    {
        var other = TestDataFactory.CreatePerson(name: "Andrés Martínez");
        var absence = new Absence(other.Id, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        absence.Approve();
        HaveAbsences(absence);

        AbsenceDiscount? discount = await _calculator.CalculateAsync(_paula.Id, October, 6_000_000m);

        Assert.Null(discount);
    }
}
