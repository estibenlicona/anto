using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ModelParameterMappingsTests
{
    // El serializador del endpoint: camelCase, como ASP.NET Core por defecto.
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [Fact]
    public void SprintConfig_SerializesWithTheContractPropertyNames()
    {
        string json = JsonSerializer.Serialize(
            ModelParameterMappings.ToDto(ModelParameterDefaults.SprintConfiguration()), Json);

        Assert.Contains("\"weeks\":2", json);
        Assert.Contains("\"sprintsPerQuarter\":6", json);
        Assert.Contains("\"hoursPerSprint\":80", json);
        Assert.Contains("\"sprintCloseTime\":\"23:00\"", json);
        Assert.Contains("\"historyWindowSprints\":6", json);
        Assert.Contains("\"minHistorySprints\":3", json);
    }

    [Fact]
    public void TallaBands_SerializesWithTheContractPropertyNames()
    {
        string json = JsonSerializer.Serialize(
            ModelParameterMappings.ToDto(ModelParameterDefaults.TallaBands()), Json);

        Assert.Contains("\"boundaries\":[20,40,60,80]", json);
        Assert.Contains("\"bands\":", json);
        Assert.Contains("\"talla\":\"XS\"", json);
        Assert.Contains("\"pmMin\":0.5", json);
        Assert.Contains("\"pmMax\":1", json);
        Assert.Contains("\"lectura\":\"Cambio menor\"", json);
    }

    [Fact]
    public void CapabilityMix_SerializesWithTheContractPropertyNames()
    {
        string json = JsonSerializer.Serialize(
            ModelParameterMappings.ToDto(ModelParameterDefaults.CapabilityMix()), Json);

        Assert.Contains("\"id\":\"backend-dev\"", json);
        Assert.Contains("\"capacidad\":\"Backend Dev\"", json);
        Assert.Contains("\"porTalla\":", json);
        Assert.Contains("\"XS\":1", json);
    }

    [Fact]
    public void QuestionPool_SerializesWithTheContractPropertyNames()
    {
        string json = JsonSerializer.Serialize(
            ModelParameterMappings.ToDto(ModelParameterDefaults.QuestionPool()), Json);

        Assert.Contains("\"id\":\"N1\"", json);
        Assert.Contains("\"dimension\":\"Negocio y cliente\"", json);
        Assert.Contains("\"texto\":", json);
        Assert.Contains("\"peso\":2", json);
    }

    [Fact]
    public void Collections_ComeBackInPositionOrder_NotInStorageOrder()
    {
        var mix = new CapabilityMix(
        [
            new CapabilityMixRow(2, "c", "Tercera", new Dictionary<string, int>()),
            new CapabilityMixRow(0, "a", "Primera", new Dictionary<string, int>()),
            new CapabilityMixRow(1, "b", "Segunda", new Dictionary<string, int>()),
        ]);

        IReadOnlyList<CapabilityMixRowDto> rows = ModelParameterMappings.ToDto(mix);

        Assert.Equal(["Primera", "Segunda", "Tercera"], rows.Select(r => r.Capacidad));
    }

    [Fact]
    public void TallaBands_MapsEveryBandOfTheSet()
    {
        TallaBandsDto dto = ModelParameterMappings.ToDto(ModelParameterDefaults.TallaBands());

        Assert.Equal(4, dto.Boundaries.Count);
        Assert.Equal(5, dto.Bands.Count);
        Assert.Equal(["XS", "S", "M", "L", "XL"], dto.Bands.Select(b => b.Talla));
    }
}
