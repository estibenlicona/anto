using GestionCapacidad.Application.Common;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Billing;

/// <summary>
/// El descuento por ausencias de una persona en un período: costo mensual ×
/// (días hábiles ausentes ÷ días hábiles del período), sumando sólo las
/// ausencias <b>aprobadas</b> que lo tocan. Reutiliza <c>BusinessDayMath</c> —
/// la misma cuenta que ya usa <c>AbsenceContext</c> para el impacto por
/// célula, aplicada acá a una sola persona y sin repartir por dedicación.
///
/// Sin ausencias aprobadas que toquen el período, el resultado es
/// <c>null</c> — nunca un descuento en cero.
/// </summary>
public sealed class BillingDiscountCalculator(IAbsenceRepository absenceRepository)
{
    /// <summary>
    /// Para un solo cálculo (p. ej. al aprobar una prefactura): carga las
    /// ausencias por su cuenta. Quien ya las tenga cargadas —como
    /// <c>BillingContext</c> resolviendo un listado entero— debe usar
    /// <see cref="Calculate"/> directamente, para no repetir la consulta una
    /// vez por persona.
    /// </summary>
    public async Task<AbsenceDiscount?> CalculateAsync(
        Guid personId,
        string period,
        decimal monthlyCost,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Absence> all = await absenceRepository.GetAllAsync(cancellationToken);
        return Calculate(all, personId, period, monthlyCost);
    }

    public static AbsenceDiscount? Calculate(
        IReadOnlyList<Absence> allAbsences,
        Guid personId,
        string period,
        decimal monthlyCost)
    {
        (DateOnly Start, DateOnly End)? bounds = BusinessDayMath.MonthBounds(period);
        if (bounds is null)
        {
            return null;
        }

        (DateOnly periodStart, DateOnly periodEnd) = bounds.Value;
        decimal periodBusinessDays = BusinessDayMath.CountBusinessDays(periodStart, periodEnd);
        if (periodBusinessDays <= 0m)
        {
            return null;
        }

        decimal businessDays = allAbsences
            .Where(a => a.PersonId == personId && a.Status == AbsenceStatus.Approved)
            .Sum(a => BusinessDayMath.BusinessDaysInMonth(
                a.StartDate, a.EndDate, a.StartsHalfDay, a.EndsHalfDay, periodStart, periodEnd));

        if (businessDays <= 0m)
        {
            return null;
        }

        int amount = (int)Math.Round(monthlyCost * (businessDays / periodBusinessDays), MidpointRounding.AwayFromZero);
        return new AbsenceDiscount(businessDays, amount);
    }
}
