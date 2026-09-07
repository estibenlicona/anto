using GestionCapacidad.Application.Common;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Dedication;

public sealed record CapacityBreakdown(
    decimal BusinessDays, decimal Holidays, decimal VacationDays, decimal AbsenceDays, decimal OtherUnavailableDays);

public sealed record CapacityResult(
    decimal ContractualFte,
    decimal AvailableFte,
    CapacityBreakdown Breakdown,
    int AvailableHours,
    int DeductedHours);

/// <summary>
/// El FTE como capacidad, y sólo capacidad. Puerto literal de
/// <c>capacityFte.ts</c>: FTE disponible = contractual × (hábiles del sprint
/// − festivos − vacaciones − ausencias − otras indisponibilidades) / hábiles,
/// acotado a <c>[0, contractual]</c>. Las horas se calculan siempre al
/// responder — nunca se guardan, es lectura derivada y nunca un parte de
/// trabajo.
/// </summary>
public sealed class CapacityCalculator(IAbsenceRepository absenceRepository)
{
    public async Task<CapacityResult> ComputeAsync(
        Guid personId,
        Fte contractualFte,
        DateOnly sprintStart,
        DateOnly sprintEnd,
        int holidays,
        decimal otherUnavailableDays,
        decimal hoursPerSprint,
        CancellationToken cancellationToken = default)
    {
        decimal businessDays = BusinessDayMath.CountBusinessDays(sprintStart, sprintEnd);

        IReadOnlyList<Absence> all = await absenceRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Absence> ownApproved = [.. all.Where(a => a.PersonId == personId && a.Status == AbsenceStatus.Approved)];

        decimal vacationDays = ownApproved
            .Where(a => a.Type == AbsenceType.Vacation)
            .Sum(a => BusinessDayMath.BusinessDaysInMonth(
                a.StartDate, a.EndDate, a.StartsHalfDay, a.EndsHalfDay, sprintStart, sprintEnd));

        decimal absenceDays = ownApproved
            .Where(a => a.Type != AbsenceType.Vacation)
            .Sum(a => BusinessDayMath.BusinessDaysInMonth(
                a.StartDate, a.EndDate, a.StartsHalfDay, a.EndsHalfDay, sprintStart, sprintEnd));

        return Compute(
            (decimal)contractualFte.Value, businessDays, holidays, vacationDays, absenceDays,
            otherUnavailableDays, hoursPerSprint);
    }

    /// <summary>La aritmética pura, separada para poder probarla sin repositorio.</summary>
    public static CapacityResult Compute(
        decimal contractualFte,
        decimal businessDays,
        decimal holidays,
        decimal vacationDays,
        decimal absenceDays,
        decimal otherUnavailableDays,
        decimal hoursPerSprint)
    {
        var breakdown = new CapacityBreakdown(businessDays, holidays, vacationDays, absenceDays, otherUnavailableDays);

        CapacityResult WithHours(decimal availableFte) => new(
            contractualFte,
            availableFte,
            breakdown,
            (int)Math.Round(availableFte * hoursPerSprint, MidpointRounding.AwayFromZero),
            (int)Math.Round((contractualFte - availableFte) * hoursPerSprint, MidpointRounding.AwayFromZero));

        // Sin días hábiles no hay capacidad que repartir, y dividir daría infinito.
        if (businessDays <= 0)
        {
            return WithHours(0m);
        }

        decimal unavailable = holidays + vacationDays + absenceDays + otherUnavailableDays;
        decimal worked = businessDays - unavailable;
        decimal raw = contractualFte * (worked / businessDays);
        decimal clamped = Math.Min(Math.Max(raw, 0m), contractualFte);

        return WithHours(Math.Round(clamped, 2, MidpointRounding.AwayFromZero));
    }

    /// <summary>
    /// Cuántos SP por FTE disponible. Separa el efecto de las ausencias del
    /// efecto de la carga; <c>null</c> sin capacidad — 28 SP sobre 0.0 FTE no
    /// es un número grande, es una situación sin sentido.
    /// </summary>
    public static decimal? PointsPerAvailableFte(decimal points, decimal availableFte) =>
        availableFte <= 0m ? null : Math.Round(points / availableFte, 2, MidpointRounding.AwayFromZero);
}
