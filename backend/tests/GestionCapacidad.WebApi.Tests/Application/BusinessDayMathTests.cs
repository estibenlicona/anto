using GestionCapacidad.Application.Common;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// Los números que fija esta clase son los que produce <c>businessDays.ts</c>
/// sobre las mismas fechas. El formulario de alta cuenta los días antes de
/// enviarlos y el servidor los cuenta al guardarlos: si divergen, la pantalla
/// prometería un descuento y el registro haría otro.
/// </summary>
public sealed class BusinessDayMathTests
{
    // Octubre de 2026: el 1 cae jueves, el 5 lunes, el 9 viernes,
    // el 10 sábado y el 11 domingo. 22 días hábiles en el mes.
    private static readonly DateOnly Thursday1 = new(2026, 10, 1);
    private static readonly DateOnly Monday5 = new(2026, 10, 5);
    private static readonly DateOnly Wednesday7 = new(2026, 10, 7);
    private static readonly DateOnly Friday9 = new(2026, 10, 9);
    private static readonly DateOnly Saturday10 = new(2026, 10, 10);
    private static readonly DateOnly Sunday11 = new(2026, 10, 11);
    private static readonly DateOnly Monday12 = new(2026, 10, 12);

    // ── Conteo ────────────────────────────────────────────────────────────────

    [Fact]
    public void AWorkWeek_CountsFive()
    {
        Assert.Equal(5m, BusinessDayMath.CountBusinessDays(Monday5, Friday9));
    }

    [Fact]
    public void AWeekend_CountsZero()
    {
        Assert.Equal(0m, BusinessDayMath.CountBusinessDays(Saturday10, Sunday11));
    }

    [Fact]
    public void ARangeSpanningTheWeekend_SkipsIt()
    {
        // Viernes a lunes: sólo el viernes y el lunes se trabajan.
        Assert.Equal(2m, BusinessDayMath.CountBusinessDays(Friday9, Monday12));
    }

    [Fact]
    public void AnInvertedRange_CountsZero()
    {
        Assert.Equal(0m, BusinessDayMath.CountBusinessDays(Friday9, Monday5));
    }

    [Fact]
    public void ASingleBusinessDay_CountsOne()
    {
        Assert.Equal(1m, BusinessDayMath.CountBusinessDays(Monday5, Monday5));
    }

    // ── Media jornada ─────────────────────────────────────────────────────────

    [Fact]
    public void ASingleDayAskedAsHalf_CountsHalf()
    {
        // Las dos marcas viajan iguales y se descuentan una sola vez: si se
        // descontaran por separado, el medio día saldría en cero.
        Assert.Equal(0.5m, BusinessDayMath.CountBusinessDays(Monday5, Monday5, true, true));
    }

    [Fact]
    public void AThreeDayRangeHalfAtBothEnds_CountsTwo()
    {
        Assert.Equal(2m, BusinessDayMath.CountBusinessDays(Monday5, Wednesday7, true, true));
    }

    [Fact]
    public void AHalfMarkOnANonBusinessDay_DiscountsNothing()
    {
        // Del sábado al lunes sólo se trabaja el lunes. La marca cae sobre el
        // sábado, que no se trabaja, así que no descuenta nada.
        Assert.Equal(1m, BusinessDayMath.CountBusinessDays(Saturday10, Monday12, true, false));
    }

    [Fact]
    public void AHalfMarkOnABusinessEdge_DiscountsHalf()
    {
        // Del viernes al lunes se trabajan dos días; la marca del final cae
        // sobre el lunes, que sí se trabaja.
        Assert.Equal(1.5m, BusinessDayMath.CountBusinessDays(Friday9, Monday12, false, true));
    }

    // ── Mes ───────────────────────────────────────────────────────────────────

    [Fact]
    public void MonthBounds_ReturnsTheFirstAndLastDay()
    {
        (DateOnly Start, DateOnly End)? bounds = BusinessDayMath.MonthBounds("2026-10");

        Assert.NotNull(bounds);
        Assert.Equal(new DateOnly(2026, 10, 1), bounds.Value.Start);
        Assert.Equal(new DateOnly(2026, 10, 31), bounds.Value.End);
    }

    [Fact]
    public void MonthBounds_HandlesFebruaryOfALeapYear()
    {
        Assert.Equal(new DateOnly(2028, 2, 29), BusinessDayMath.MonthBounds("2028-02")!.Value.End);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("2026-13")]
    [InlineData("2026-00")]
    [InlineData("2026/10")]
    [InlineData("octubre")]
    [InlineData("2026-1")]
    public void MonthBounds_WithSomethingThatIsNotAMonth_ReturnsNull(string? month)
    {
        Assert.Null(BusinessDayMath.MonthBounds(month));
    }

    [Fact]
    public void October2026_HasTwentyTwoBusinessDays()
    {
        (DateOnly Start, DateOnly End) bounds = BusinessDayMath.MonthBounds("2026-10")!.Value;

        Assert.Equal(22m, BusinessDayMath.CountBusinessDays(bounds.Start, bounds.End));
    }

    // ── Recorte contra el mes ─────────────────────────────────────────────────

    [Fact]
    public void ARangeFullyInsideTheMonth_CountsAllOfIt()
    {
        Assert.Equal(3m, InOctober(Monday5, Wednesday7, false, false));
    }

    [Fact]
    public void ARangeOutsideTheMonth_CountsZero()
    {
        Assert.Equal(0m, InOctober(new DateOnly(2026, 11, 3), new DateOnly(2026, 11, 5), false, false));
    }

    [Fact]
    public void ARangeThatOnlyTouchesTheMonth_CountsOnlyTheDaysInside()
    {
        // Del 29 de septiembre (martes) al 2 de octubre (viernes): en octubre
        // caen el jueves 1 y el viernes 2.
        Assert.Equal(2m, InOctober(new DateOnly(2026, 9, 29), new DateOnly(2026, 10, 2), false, false));
    }

    [Fact]
    public void TheHalfMarkAppliesOnlyAtTheRealEdgeOfTheRange()
    {
        // Un rango que cruza el fin de mes tiene, en cada tramo, un borde que
        // es del calendario y no de la ausencia. Si ese borde llevara la
        // marca, la misma media jornada se descontaría en los dos meses.
        var start = new DateOnly(2026, 10, 29);  // jueves
        var end = new DateOnly(2026, 11, 3);     // martes

        decimal inOctober = InOctober(start, end, true, true);
        decimal inNovember = BusinessDayMath.BusinessDaysInMonth(
            start, end, true, true,
            new DateOnly(2026, 11, 1), new DateOnly(2026, 11, 30));

        // Días hábiles del rango completo: 29, 30 (viernes), 2 y 3 = 4,
        // menos media jornada en cada extremo real = 3.
        Assert.Equal(3m, BusinessDayMath.CountBusinessDays(start, end, true, true));
        // Y los dos tramos suman exactamente eso: ni más ni menos.
        Assert.Equal(3m, inOctober + inNovember);
        Assert.Equal(1.5m, inOctober);
        Assert.Equal(1.5m, inNovember);
    }

    [Fact]
    public void ClampRange_WithoutOverlap_ReturnsNull()
    {
        Assert.Null(BusinessDayMath.ClampRange(
            new DateOnly(2026, 11, 1), new DateOnly(2026, 11, 5), Thursday1, new DateOnly(2026, 10, 31)));
    }

    private static decimal InOctober(DateOnly start, DateOnly end, bool startsHalf, bool endsHalf) =>
        BusinessDayMath.BusinessDaysInMonth(
            start, end, startsHalf, endsHalf,
            new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 31));
}
