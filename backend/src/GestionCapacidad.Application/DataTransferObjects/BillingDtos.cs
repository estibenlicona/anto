namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// Una prefactura, con lo guardado más lo derivado. El snapshot de la persona
/// (nombre, cargo, célula, proveedor, costo mensual) se congeló al generar;
/// el descuento se recalcula en cada respuesta salvo que ya esté aprobada.
///
/// <c>Status = "None"</c> es sintético: la persona externa todavía no tiene
/// registro ese período, y la fila no está persistida.
/// </summary>
public sealed record PrefactureDto(
    Guid Id,
    Guid PersonId,
    string PersonName,
    string Position,
    string? SquadName,
    Guid ProviderId,
    string ProviderName,
    string Period,
    string Status,
    decimal MonthlyCost,
    AbsenceDiscountDto? AbsenceDiscount,
    BillingAdjustmentDto? Adjustment,
    decimal Expected,
    PrefactureDocumentDto? Document,
    int? Prefactured,
    decimal? Difference,
    ObjectionDto? Objection,
    string? ApprovalNote,
    DateTime CreatedAtUtc,
    DateTime? ApprovedAtUtc);

public sealed record AbsenceDiscountDto(decimal BusinessDays, int Amount);

public sealed record BillingAdjustmentDto(int Amount, string Reason, string Note);

public sealed record PrefactureDocumentDto(
    string Number,
    DateOnly ReceivedAt,
    int Amount,
    string Currency,
    ImputationDto Imputation);

/// <summary>Un campo con contenido, o ausente — nunca cadena vacía.</summary>
public sealed record ImputationDto(
    string? CostObject,
    string? Concept,
    string? AccountName,
    string? AccountNumber,
    string? CostCenter,
    string? PurchaseOrder,
    string? PaymentAccount);

public sealed record ObjectionDto(string Reason, DateTime ObjectedAtUtc);

// ── Cuerpos de las peticiones ────────────────────────────────────────────────

public sealed record GeneratePrefacturesRequest(string Period);

public sealed record RegisterPrefactureRequest(
    string Number,
    DateOnly ReceivedAt,
    decimal Amount,
    string Currency,
    ImputationDto Imputation);

public sealed record SetPrefacturedRequest(decimal Prefactured);

public sealed record SetBillingStatusRequest(string Status, string? Note, string? Reason);
