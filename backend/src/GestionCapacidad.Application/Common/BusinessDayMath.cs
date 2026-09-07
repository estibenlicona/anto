using System.Globalization;
using System.Text.RegularExpressions;

namespace GestionCapacidad.Application.Common;

/// <summary>
/// La aritmética de días hábiles y su recorte contra un mes.
///
/// Vive acá una sola vez porque tres módulos la necesitan y tienen que dar el
/// mismo número: Ausencias la usa para contar y repartir el impacto, Capacidad
/// para descontar del sprint, y Prefacturación para descontar del costo del
/// mes. Es espejo de <c>businessDays.ts</c> del frontend, que el formulario de
/// alta usa para contar los días antes de enviarlos.
///
/// Días hábiles son de lunes a viernes. **Los festivos no se descuentan**: es
/// la decisión vigente del modelo, la misma del otro lado. Cuando se
/// incorporen, entran acá y los dos lados cambian a la vez.
///
/// Los días son <c>decimal</c> porque una media jornada los hace múltiplos de
/// 0.5, no enteros.
/// </summary>
public static partial class BusinessDayMath
{
    public static bool IsBusinessDay(DateOnly date) =>
        date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday;

    /// <summary>
    /// Días hábiles del rango, ambos extremos incluidos; 0 si el rango es
    /// inválido.
    ///
    /// Cada extremo marcado descuenta media jornada, y sólo si cae en día
    /// hábil: un sábado no se trabaja, así que no puede pedirse a medias. Un
    /// rango de un solo día descuenta la media jornada **una vez**: sus dos
    /// extremos son el mismo día y las dos marcas viajan iguales, así que
    /// descontarlas por separado dejaría el medio día en cero.
    /// </summary>
    public static decimal CountBusinessDays(
        DateOnly start,
        DateOnly end,
        bool startsHalfDay = false,
        bool endsHalfDay = false)
    {
        if (end < start)
        {
            return 0m;
        }

        decimal count = 0m;
        for (DateOnly cursor = start; cursor <= end; cursor = cursor.AddDays(1))
        {
            if (IsBusinessDay(cursor))
            {
                count += 1m;
            }
        }

        if (count == 0m)
        {
            return 0m;
        }

        if (start == end)
        {
            return (startsHalfDay || endsHalfDay) && IsBusinessDay(start) ? count - 0.5m : count;
        }

        if (startsHalfDay && IsBusinessDay(start))
        {
            count -= 0.5m;
        }

        if (endsHalfDay && IsBusinessDay(end))
        {
            count -= 0.5m;
        }

        return count;
    }

    /// <summary>Primer y último día del mes <c>YYYY-MM</c>; <c>null</c> si no tiene esa forma.</summary>
    public static (DateOnly Start, DateOnly End)? MonthBounds(string? month)
    {
        if (month is null || !MonthPattern().IsMatch(month))
        {
            return null;
        }

        int year = int.Parse(month[..4], CultureInfo.InvariantCulture);
        int monthNumber = int.Parse(month[5..], CultureInfo.InvariantCulture);

        if (monthNumber is < 1 or > 12)
        {
            return null;
        }

        var start = new DateOnly(year, monthNumber, 1);
        return (start, start.AddMonths(1).AddDays(-1));
    }

    /// <summary>Intersección de dos rangos inclusivos; <c>null</c> si no se tocan.</summary>
    public static (DateOnly Start, DateOnly End)? ClampRange(
        DateOnly start,
        DateOnly end,
        DateOnly boundStart,
        DateOnly boundEnd)
    {
        DateOnly clampedStart = start > boundStart ? start : boundStart;
        DateOnly clampedEnd = end < boundEnd ? end : boundEnd;

        return clampedStart <= clampedEnd ? (clampedStart, clampedEnd) : null;
    }

    /// <summary>
    /// Días hábiles de un rango que caen dentro de un mes.
    ///
    /// La marca de media jornada se aplica **sólo cuando el extremo del tramo
    /// es el extremo real del rango**. Un rango que cruza el fin de mes tiene,
    /// en cada tramo, un borde que no es suyo sino el del calendario; marcarlo
    /// descontaría la misma media jornada dos veces, una en cada mes.
    /// </summary>
    public static decimal BusinessDaysInMonth(
        DateOnly start,
        DateOnly end,
        bool startsHalfDay,
        bool endsHalfDay,
        DateOnly monthStart,
        DateOnly monthEnd)
    {
        (DateOnly Start, DateOnly End)? within = ClampRange(start, end, monthStart, monthEnd);
        if (within is null)
        {
            return 0m;
        }

        return CountBusinessDays(
            within.Value.Start,
            within.Value.End,
            startsHalfDay && within.Value.Start == start,
            endsHalfDay && within.Value.End == end);
    }

    [GeneratedRegex(@"^\d{4}-\d{2}$")]
    private static partial Regex MonthPattern();
}
