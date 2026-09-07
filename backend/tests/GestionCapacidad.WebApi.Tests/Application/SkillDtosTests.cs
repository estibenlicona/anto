using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SkillDtosTests
{
    [Fact]
    public void SkillsCatalogDto_SerializesWithTheContractPropertyNames()
    {
        var dto = new SkillsCatalogDto(
            Version: 3,
            Positions: ["Backend Dev", "Data Engineer"],
            Skills:
            [
                new SkillDto(
                    Guid.NewGuid(),
                    "SQL",
                    "technical",
                    "Consultas y modelado relacional",
                    true,
                    [new SkillLevelDto(1, []), new SkillLevelDto(2, ["Escribe joins simples"])],
                    [new PositionExpectationDto("Backend Dev", null), new PositionExpectationDto("Data Engineer", 3)]),
            ]);

        string json = JsonSerializer.Serialize(dto, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"version\":3", json);
        Assert.Contains("\"positions\":[\"Backend Dev\",\"Data Engineer\"]", json);
        Assert.Contains("\"group\":\"technical\"", json);
        Assert.Contains("\"active\":true", json);
        Assert.Contains("\"levels\":[", json);
        Assert.Contains("\"criteria\":[]", json);
        Assert.Contains("\"expectations\":[", json);
        Assert.Contains("\"level\":null", json);
        Assert.Contains("\"level\":3", json);
    }
}
