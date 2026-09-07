using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// La prefactura de una persona externa en un período: lo que se espera
/// cobrar (costo mensual menos el descuento por ausencias, más el ajuste), y
/// el ciclo de recibir, revisar y decidir sobre el documento del proveedor.
///
/// El snapshot de la persona —nombre, cargo, célula y proveedor— se congela
/// al generar y no cambia después: es un registro de un período cerrado. Sólo
/// el descuento por ausencias se recalcula en cada respuesta, y deja de
/// hacerlo en cuanto se aprueba.
/// </summary>
public sealed class Prefacture : AggregateRoot
{
    private Prefacture()
    {
    }

    public Prefacture(
        Guid personId,
        string personName,
        string position,
        string? squadName,
        Guid providerId,
        decimal monthlyCost,
        string period)
    {
        if (personId == Guid.Empty)
        {
            throw new DomainException("La persona de la prefactura es obligatoria");
        }

        if (string.IsNullOrWhiteSpace(personName))
        {
            throw new DomainException("El nombre de la persona es obligatorio");
        }

        if (providerId == Guid.Empty)
        {
            throw new DomainException("El proveedor de la prefactura es obligatorio");
        }

        if (monthlyCost < 0)
        {
            throw new DomainException("El costo mensual debe ser mayor o igual a cero");
        }

        if (!IsValidPeriod(period))
        {
            throw new DomainException("El período debe tener la forma YYYY-MM");
        }

        PersonId = personId;
        PersonName = personName.Trim();
        Position = position?.Trim() ?? string.Empty;
        SquadName = string.IsNullOrWhiteSpace(squadName) ? null : squadName.Trim();
        ProviderId = providerId;
        MonthlyCost = monthlyCost;
        Period = period;
        Status = BillingStatus.Pending;
    }

    /// <summary>Snapshot congelado al generar: nunca cambia después.</summary>
    public Guid PersonId { get; private set; }

    public string PersonName { get; private set; } = string.Empty;

    public string Position { get; private set; } = string.Empty;

    public string? SquadName { get; private set; }

    public Guid ProviderId { get; private set; }

    public decimal MonthlyCost { get; private set; }

    public string Period { get; private set; } = string.Empty;

    public BillingStatus Status { get; private set; } = BillingStatus.Pending;

    public BillingAdjustment? Adjustment { get; private set; }

    public PrefactureDocument? Document { get; private set; }

    /// <summary>Lo que el proveedor propone cobrar; nulo mientras no llegó.</summary>
    public int? Prefactured { get; private set; }

    public Objection? Objection { get; private set; }

    public string? ApprovalNote { get; private set; }

    /// <summary>Descuento congelado al aprobar: una prefactura aprobada no se mueve más.</summary>
    public AbsenceDiscount? FrozenDiscount { get; private set; }

    public DateTime? ApprovedAtUtc { get; private set; }

    // ── Documento del proveedor ─────────────────────────────────────────────

    /// <summary>
    /// Registra el documento recibido. Una sola vez por período, salvo
    /// corrigiendo una objetada — es la única vía a un segundo documento, y
    /// siempre deja la prefactura en <see cref="BillingStatus.Received"/>,
    /// aunque venga de <see cref="BillingStatus.Objected"/>.
    /// </summary>
    public void RegisterDocument(PrefactureDocument document)
    {
        ArgumentNullException.ThrowIfNull(document);

        if (Status == BillingStatus.Approved)
        {
            throw new DomainException("La prefactura ya está aprobada");
        }

        if (Document is not null && Status != BillingStatus.Objected)
        {
            throw new DomainException("Esta persona ya tiene una prefactura registrada en el período");
        }

        Document = document;
        Prefactured = document.Amount;
        Status = BillingStatus.Received;
        MarkUpdated();
    }

    // ── Trabajar el período ──────────────────────────────────────────────────

    public void SetPrefactured(decimal amount)
    {
        EnsureEditable();

        if (Document is null)
        {
            throw new DomainException("Todavía no llegó la prefactura");
        }

        if (amount < 0)
        {
            throw new DomainException("El valor prefacturado debe ser mayor o igual a cero");
        }

        Prefactured = (int)Math.Round(amount, MidpointRounding.AwayFromZero);
        MoveToReview();
        MarkUpdated();
    }

    public void SetAdjustment(BillingAdjustment adjustment)
    {
        ArgumentNullException.ThrowIfNull(adjustment);

        EnsureEditable();

        Adjustment = adjustment;
        MoveToReview();
        MarkUpdated();
    }

    public void ClearAdjustment()
    {
        EnsureEditable();

        Adjustment = null;
        MoveToReview();
        MarkUpdated();
    }

    // ── Decisión ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Aprueba con el descuento vigente en el momento de aprobar — se congela
    /// tal cual queda. Con diferencia distinta de cero contra lo esperado,
    /// exige una nota que la justifique.
    /// </summary>
    public void Approve(AbsenceDiscount? discount, string? note, DateTime approvedAtUtc)
    {
        EnsureReviewable();

        decimal expected = MonthlyCost - (discount?.Amount ?? 0) + (Adjustment?.Amount ?? 0);
        decimal difference = Prefactured is null ? 0 : Prefactured.Value - expected;

        string? trimmedNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        if (difference != 0 && trimmedNote is null)
        {
            throw new DomainException(
                "La prefactura tiene diferencia contra lo esperado: hace falta una nota que justifique aprobarla");
        }

        Status = BillingStatus.Approved;
        ApprovalNote = trimmedNote;
        ApprovedAtUtc = approvedAtUtc;
        FrozenDiscount = discount;
        MarkUpdated();
    }

    public void Object(string reason, DateTime objectedAtUtc)
    {
        EnsureReviewable();

        Objection = new Objection(reason, objectedAtUtc);
        Status = BillingStatus.Objected;
        MarkUpdated();
    }

    // ── Guardas privadas ──────────────────────────────────────────────────────

    /// <summary>
    /// Aprobada u objetada no se toca: la objetada está en manos del
    /// proveedor hasta que llegue la corregida.
    /// </summary>
    private void EnsureEditable()
    {
        if (Status == BillingStatus.Approved)
        {
            throw new DomainException("La prefactura está aprobada: no se puede ajustar");
        }

        if (Status == BillingStatus.Objected)
        {
            throw new DomainException("La prefactura está objetada: espera la corregida del proveedor");
        }
    }

    private void EnsureReviewable()
    {
        if (!Status.IsReviewable)
        {
            throw new DomainException("Transición de estado inválida");
        }
    }

    /// <summary>Trabajar un período recién llegado lo pone en revisión.</summary>
    private void MoveToReview()
    {
        if (Status == BillingStatus.Received)
        {
            Status = BillingStatus.InReview;
        }
    }

    private static bool IsValidPeriod(string? period)
    {
        if (string.IsNullOrWhiteSpace(period) || period.Length != 7 || period[4] != '-')
        {
            return false;
        }

        return int.TryParse(period[..4], out _) &&
            int.TryParse(period[5..], out int month) && month is >= 1 and <= 12;
    }
}
