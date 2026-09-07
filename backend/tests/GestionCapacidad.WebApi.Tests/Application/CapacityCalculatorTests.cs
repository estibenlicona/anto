using GestionCapacidad.Application.Dedication;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CapacityCalculatorTests
{
    [Fact]
    public void Compute_TenBusinessDays_OneHoliday_OneAbsence_GivesZeroPointEighty()
    {
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 1.0m, businessDays: 10m, holidays: 1m, vacationDays: 0m, absenceDays: 1m,
            otherUnavailableDays: 0m, hoursPerSprint: 80m);

        Assert.Equal(0.80m, result.AvailableFte);
        Assert.Equal(10m, result.Breakdown.BusinessDays);
        Assert.Equal(1m, result.Breakdown.Holidays);
        Assert.Equal(1m, result.Breakdown.AbsenceDays);
    }

    [Fact]
    public void Compute_PartTimeContractor_WithoutDeductions_KeepsTheirOwnFte()
    {
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 0.5m, businessDays: 10m, holidays: 0m, vacationDays: 0m, absenceDays: 0m,
            otherUnavailableDays: 0m, hoursPerSprint: 100m);

        Assert.Equal(0.50m, result.AvailableFte);
    }

    [Fact]
    public void Compute_HalfDayAbsence_DiscountsHalfADay()
    {
        // 0.5 días de ausencia sobre 10 hábiles con contrato completo: 9.5/10 = 0.95.
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 1.0m, businessDays: 10m, holidays: 0m, vacationDays: 0m, absenceDays: 0.5m,
            otherUnavailableDays: 0m, hoursPerSprint: 100m);

        Assert.Equal(0.95m, result.AvailableFte);
    }

    [Fact]
    public void Compute_WithoutAnyDeduction_ShowsOnlyAvailableHours()
    {
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 1.0m, businessDays: 10m, holidays: 0m, vacationDays: 0m, absenceDays: 0m,
            otherUnavailableDays: 0m, hoursPerSprint: 80m);

        Assert.Equal(1.0m, result.AvailableFte);
        Assert.Equal(80, result.AvailableHours);
        Assert.Equal(0, result.DeductedHours);
    }

    [Fact]
    public void Compute_DeductionsExceedingBusinessDays_ClampsToZero_NeverNegative()
    {
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 1.0m, businessDays: 10m, holidays: 5m, vacationDays: 5m, absenceDays: 5m,
            otherUnavailableDays: 0m, hoursPerSprint: 80m);

        Assert.Equal(0m, result.AvailableFte);
    }

    [Fact]
    public void Compute_WithZeroBusinessDays_ReturnsZero_WithoutDividingByZero()
    {
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 1.0m, businessDays: 0m, holidays: 0m, vacationDays: 0m, absenceDays: 0m,
            otherUnavailableDays: 0m, hoursPerSprint: 80m);

        Assert.Equal(0m, result.AvailableFte);
    }

    [Fact]
    public void Compute_HoursForAPartTimeContractor()
    {
        // Calendario 100 h/sprint, contrato 0.80, un festivo deja 0.72 disponible.
        CapacityResult result = CapacityCalculator.Compute(
            contractualFte: 0.80m, businessDays: 10m, holidays: 1m, vacationDays: 0m, absenceDays: 0m,
            otherUnavailableDays: 0m, hoursPerSprint: 100m);

        Assert.Equal(0.72m, result.AvailableFte);
        Assert.Equal(72, result.AvailableHours);
        Assert.Equal(8, result.DeductedHours);
    }
}
