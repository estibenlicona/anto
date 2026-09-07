using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ExpertiseLineDtosTests
{
    [Fact]
    public void ExpertiseLineDetailDto_SerializesWithTheContractPropertyNames()
    {
        var detail = new ExpertiseLineDetailDto(
            Id: Guid.NewGuid(),
            Name: "Backend",
            Code: "BE",
            Description: null,
            Status: "Active",
            Lead: new LineLeadDto(Guid.NewGuid(), "María González"),
            PeopleCount: 2,
            AvailableFte: 1.5,
            People:
            [
                new LinePersonDto(
                    Guid.NewGuid(), "María González", "Backend Dev", 3, "Intermedio", 1.0, true,
                    new LinePersonAllocationDto(Guid.NewGuid(), "Backend Platform", 80m)),
            ],
            Capacity: new LineCapacityDto(2, 1.5, 0.8, 0.7, 46.7));

        string json = JsonSerializer.Serialize(detail, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"peopleCount\":2", json);
        Assert.Contains("\"availableFte\":1.5", json);
        Assert.Contains("\"allocatedFte\":0.8", json);
        Assert.Contains("\"freeFte\":0.7", json);
        Assert.Contains("\"unallocatedPercentage\":46.7", json);
        Assert.Contains("\"isLead\":true", json);
        Assert.Contains("\"levelLabel\":\"Intermedio\"", json);
        Assert.Contains("\"dedicationPercentage\":80", json);
    }

    [Fact]
    public void RosterPersonDto_SerializesWithTheContractPropertyNames()
    {
        var person = new RosterPersonDto(Guid.NewGuid(), "Sin Línea", "QA Engineer", 2, "Competente", 1.0, null);

        string json = JsonSerializer.Serialize(person, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"levelLabel\":\"Competente\"", json);
        Assert.Contains("\"line\":null", json);
    }
}
