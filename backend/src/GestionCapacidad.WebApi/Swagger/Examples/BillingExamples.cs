using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Billing.GeneratePrefactures;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

internal static class BillingExampleIds
{
    public static readonly Guid PaulaId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid GftId = Guid.Parse("22222222-2222-2222-2222-222222222222");
}

/// <summary>
/// En revisión, con descuento por ausencias y documento sin orden de compra
/// todavía: llegó antes que la orden, y es el caso que distingue un campo
/// faltante de uno en blanco.
/// </summary>
public sealed class PrefactureDtoExample : IExamplesProvider<PrefactureDto>
{
    public PrefactureDto GetExamples() => new(
        Id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        PersonId: BillingExampleIds.PaulaId,
        PersonName: "Paula Ramírez",
        Position: "Data Engineer",
        SquadName: "Plataforma de Datos",
        ProviderId: BillingExampleIds.GftId,
        ProviderName: "GFT",
        Period: "2026-10",
        Status: "InReview",
        MonthlyCost: 8_400_000m,
        AbsenceDiscount: new AbsenceDiscountDto(3m, 1_145_000),
        Adjustment: null,
        Expected: 7_255_000m,
        Document: new PrefactureDocumentDto(
            "FE-2049",
            new DateOnly(2026, 10, 5),
            8_400_000,
            "COP",
            new ImputationDto(
                "Plataforma de Datos", "Servicios profesionales", "Servicios técnicos", "5135-05",
                "CC-1001", null, "Bancolombia 4567")),
        Prefactured: 8_400_000,
        Difference: 1_145_000m,
        Objection: null,
        ApprovalNote: null,
        CreatedAtUtc: new DateTime(2026, 10, 5, 14, 0, 0, DateTimeKind.Utc),
        ApprovedAtUtc: null);
}

public sealed class GeneratePrefacturesRequestExample : IExamplesProvider<GeneratePrefacturesRequest>
{
    public GeneratePrefacturesRequest GetExamples() => new("2026-11");
}

public sealed class RegisterPrefactureRequestExample : IExamplesProvider<RegisterPrefactureRequest>
{
    public RegisterPrefactureRequest GetExamples() => new(
        "FE-2049",
        new DateOnly(2026, 10, 5),
        8_400_000m,
        "COP",
        new ImputationDto(
            "Plataforma de Datos", "Servicios profesionales", "Servicios técnicos", "5135-05",
            "CC-1001", null, "Bancolombia 4567"));
}

public sealed class SetPrefacturedRequestExample : IExamplesProvider<SetPrefacturedRequest>
{
    public SetPrefacturedRequest GetExamples() => new(8_400_000m);
}

public sealed class BillingAdjustmentDtoExample : IExamplesProvider<BillingAdjustmentDto>
{
    public BillingAdjustmentDto GetExamples() => new(150_000, "Overtime", "Turno adicional el fin de semana");
}

/// <summary>Objetar exige el motivo; aprobar exige la nota sólo si hay diferencia.</summary>
public sealed class SetBillingStatusRequestExample : IExamplesProvider<SetBillingStatusRequest>
{
    public SetBillingStatusRequest GetExamples() => new(
        "Objected", null, "Facturaron completo: tuvo días de permiso aprobados que no descontaron.");
}
