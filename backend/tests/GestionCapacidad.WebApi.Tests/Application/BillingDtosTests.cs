using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BillingDtosTests
{
    [Fact]
    public void PrefactureDto_SerializesWithTheContractPropertyNames()
    {
        var dto = new PrefactureDto(
            Id: Guid.NewGuid(),
            PersonId: Guid.NewGuid(),
            PersonName: "Paula Ramírez",
            Position: "Data Engineer",
            SquadName: "Plataforma de Datos",
            ProviderId: Guid.NewGuid(),
            ProviderName: "GFT",
            Period: "2026-10",
            Status: "InReview",
            MonthlyCost: 6_000_000m,
            AbsenceDiscount: new AbsenceDiscountDto(3m, 800_000),
            Adjustment: new BillingAdjustmentDto(100_000, "Overtime", "Turno extra"),
            Expected: 5_300_000m,
            Document: new PrefactureDocumentDto(
                "FE-1",
                new DateOnly(2026, 10, 5),
                6_000_000,
                "COP",
                new ImputationDto("CO-1", "Servicios", "Cuenta", "5135-05", "CC-1001", null, "Bancolombia")),
            Prefactured: 6_000_000,
            Difference: 700_000m,
            Objection: new ObjectionDto("motivo", DateTime.UtcNow),
            ApprovalNote: null,
            CreatedAtUtc: DateTime.UtcNow,
            ApprovedAtUtc: null);

        string json = JsonSerializer.Serialize(dto, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"personName\":\"Paula", json);
        Assert.Contains("\"squadName\":\"Plataforma de Datos\"", json);
        Assert.Contains("\"providerName\":\"GFT\"", json);
        Assert.Contains("\"monthlyCost\":6000000", json);
        Assert.Contains("\"absenceDiscount\":{\"businessDays\":3,\"amount\":800000}", json);
        Assert.Contains("\"expected\":5300000", json);
        Assert.Contains("\"prefactured\":6000000", json);
        Assert.Contains("\"difference\":700000", json);
        Assert.Contains("\"approvalNote\":null", json);
        Assert.Contains("\"approvedAtUtc\":null", json);
        Assert.Contains("\"purchaseOrder\":null", json);
    }
}
