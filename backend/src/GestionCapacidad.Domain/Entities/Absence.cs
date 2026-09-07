using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una ausencia de una persona del chapter: qué tipo, qué rango de fechas, y
/// en qué punto de la decisión está.
///
/// Sólo se guarda lo que se pidió. Los días hábiles, los que caen dentro de un
/// mes y el impacto por célula **no** viven acá: dependen del mes que se
/// pregunte y de una dedicación que cambia sin que la ausencia cambie, así que
/// se calculan al responder.
///
/// Que la persona exista y que no haya otra ausencia suya cruzada tampoco se
/// valida acá: las dos exigen mirar más allá del agregado, y las hace cumplir
/// el use case.
/// </summary>
public sealed class Absence : AggregateRoot
{
    private Absence()
    {
    }

    public Absence(
        Guid personId,
        AbsenceType type,
        DateOnly startDate,
        DateOnly endDate,
        bool startsHalfDay,
        bool endsHalfDay)
    {
        ArgumentNullException.ThrowIfNull(type);

        if (personId == Guid.Empty)
        {
            throw new DomainException("La persona de la ausencia es obligatoria.");
        }

        if (endDate < startDate)
        {
            throw new DomainException("El rango de fechas es inválido");
        }

        // Las dos marcas son la misma cosa dicha dos veces: "este día se pide
        // a media jornada". El contrato las transporta por separado, así que
        // la invariante las mantiene coherentes.
        if (startsHalfDay != endsHalfDay)
        {
            throw new DomainException("El medio día es del día pedido, no de un extremo");
        }

        if (startsHalfDay && type != AbsenceType.Leave)
        {
            throw new DomainException("Sólo un permiso puede pedirse por medio día");
        }

        if (startsHalfDay && startDate != endDate)
        {
            throw new DomainException("Un medio día se pide sobre un solo día");
        }

        // Un rango sin días hábiles no descuenta nada, así que registrarlo no
        // significaría nada. Cubre el permiso pedido sobre un sábado.
        if (!HasAnyBusinessDay(startDate, endDate))
        {
            throw new DomainException("El rango no tiene días hábiles");
        }

        PersonId = personId;
        Type = type;
        StartDate = startDate;
        EndDate = endDate;
        StartsHalfDay = startsHalfDay;
        EndsHalfDay = endsHalfDay;
        Status = AbsenceStatus.Requested;
    }

    public Guid PersonId { get; private set; }

    public AbsenceType Type { get; private set; } = AbsenceType.Vacation;

    /// <summary>Primer día ausente.</summary>
    public DateOnly StartDate { get; private set; }

    /// <summary>Último día ausente, incluido.</summary>
    public DateOnly EndDate { get; private set; }

    /// <summary>El primer día se pide a media jornada.</summary>
    public bool StartsHalfDay { get; private set; }

    /// <summary>El último día se pide a media jornada. En un rango de un día, igual que <see cref="StartsHalfDay"/>.</summary>
    public bool EndsHalfDay { get; private set; }

    public AbsenceStatus Status { get; private set; } = AbsenceStatus.Requested;

    /// <summary>Por qué se rechazó; nulo mientras no lo esté.</summary>
    public string? RejectReason { get; private set; }

    // ── Decisión ──────────────────────────────────────────────────────────────

    /// <summary>Aprobar sólo tiene sentido sobre algo que todavía se está pidiendo.</summary>
    public void Approve()
    {
        EnsureNotTerminal();

        if (Status != AbsenceStatus.Requested)
        {
            throw new DomainException("Sólo una ausencia solicitada puede aprobarse");
        }

        Status = AbsenceStatus.Approved;
        MarkUpdated();
    }

    /// <summary>
    /// Rechazar sirve para negar una solicitud y también para revertir una
    /// aprobación equivocada, que es la única forma de deshacerla. El motivo
    /// queda trazado porque de estas decisiones salen consecuencias en la
    /// factura del proveedor y en la capacidad de la célula.
    /// </summary>
    public void Reject(string reason)
    {
        EnsureNotTerminal();

        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new DomainException("El motivo del rechazo es obligatorio");
        }

        if (reason.Trim().Length > 500)
        {
            throw new DomainException("El motivo del rechazo no puede superar 500 caracteres.");
        }

        Status = AbsenceStatus.Rejected;
        RejectReason = reason.Trim();
        MarkUpdated();
    }

    /// <summary>
    /// Una rechazada no vuelve atrás: corregir un registro equivocado es
    /// registrar la ausencia de nuevo, y por eso el solape sólo mira las que
    /// no están rechazadas.
    /// </summary>
    private void EnsureNotTerminal()
    {
        if (Status == AbsenceStatus.Rejected)
        {
            throw new DomainException("Una ausencia rechazada no cambia de estado");
        }
    }

    /// <summary>
    /// Días hábiles son de lunes a viernes. Los festivos no se descuentan —
    /// decisión vigente, la misma del cálculo del frontend: cuando se
    /// incorporen, entran acá y en <c>BusinessDayMath</c> a la vez.
    /// </summary>
    private static bool HasAnyBusinessDay(DateOnly start, DateOnly end)
    {
        for (DateOnly cursor = start; cursor <= end; cursor = cursor.AddDays(1))
        {
            if (cursor.DayOfWeek != DayOfWeek.Saturday && cursor.DayOfWeek != DayOfWeek.Sunday)
            {
                return true;
            }
        }

        return false;
    }
}
