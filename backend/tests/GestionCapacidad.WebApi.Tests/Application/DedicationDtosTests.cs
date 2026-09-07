using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DedicationDtosTests
{
    [Fact]
    public void CollaboratorDedicationRowDto_SerializesWithTheContractPropertyNames()
    {
        var row = new CollaboratorDedicationRowDto(
            Person: new DedicationPersonDto(Guid.NewGuid(), "Paula", "Data Engineer", "Experto", null, 1.0m),
            Allocation: new DedicationAllocationDto(Guid.NewGuid(), Guid.NewGuid(), "Backend Platform", null, 80m, 50m, 30m),
            HasIdentity: true,
            Sprint: new SprintRefDto("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Sealed", DateTime.UtcNow),
            Capacity: new CapacityDto(1.0m, 0.72m, new CapacityBreakdownDto(10m, 1m, 0m, 1m, 0m), 72, 8),
            Execution: new SprintExecutionDto(30m, 22m, 8m, 73.3m, 8m, 26.7m),
            Reference: new ReferenceDto(22m, 21m, 6, true, 8m, 36.4m, 0m),
            Multitasking: new MultitaskingDto(2, [], 6, 4),
            SprintInitiatives: [],
            Balance: new BalanceSignalDto("PossibleOverload", 2, 0, "Different", null, []));

        string json = JsonSerializer.Serialize(row, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"hasIdentity\":true", json);
        Assert.Contains("\"contractualFte\":1", json);
        Assert.Contains("\"availableFte\":0.72", json);
        Assert.Contains("\"squadDeviationRate\":0", json);
        Assert.Contains("\"overCount\":2", json);
        Assert.Contains("\"notEvaluableReason\":null", json);
        Assert.Contains("\"snapshotStatus\":\"Sealed\"", json);
        Assert.Contains("\"sealedAt\":", json);
        Assert.Contains("\"declaredDedicationPercentage\":80", json);
    }

    [Fact]
    public void WorkItemDto_SerializesWithTheContractPropertyNames()
    {
        var item = new WorkItemDto(
            "wi-1", 1001, "Implementar X", "Initiative", "ep-1", "Épica", "ini-1", "Iniciativa",
            8m, "Closed", true, "Board 1", "https://dev.azure.com/wi-1");

        string json = JsonSerializer.Serialize(item, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"addedAfterSprintStart\":true", json);
        Assert.Contains("\"initiativeId\":\"ini-1\"", json);
    }
}
