using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Una persona interna con célula, identidad DevOps y balance del sprint en curso.</summary>
public sealed class PersonDetailDtoExample : IExamplesProvider<PersonDetailDto>
{
    public PersonDetailDto GetExamples()
    {
        var person = new PersonDto(
            Guid.Parse("11111111-1111-1111-1111-111111111111"), "María González", "1036884001",
            "", "maria.gonzalez@tuya.com", "Backend Dev", "contributor", null, null, 0,
            3, "Intermedio", "Intermediate", "Intermedio", "Hybrid", 1.0f, 6_000_000m,
            new DateOnly(2021, 3, 15), Guid.Parse("c4a91111-1111-1111-1111-111111111111"), null,
            DateTime.UtcNow, null, 80,
            [new PersonStackDto(".NET", 3, true)]);

        return new PersonDetailDto(
            Person: person,
            ProviderName: null,
            ContractEndsAt: null,
            ChapterName: "Core y Datos",
            ChapterLeadName: "Tomás Giraldo",
            ExpertiseLineName: "Backend",
            ExpertiseLineLeadName: "Carlos López",
            Allocation: new PersonDetailAllocationDto(
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Guid.Parse("33333333-3333-3333-3333-333333333333"),
                "Backend Platform", "High", "Ecosistema Digital", "Servicios y APIs del chapter.",
                ["Carlos López", "Diego Salazar"], 80m, 50m, 30m, new DateOnly(2024, 1, 1), 3),
            DevOpsIdentity: new DevOpsIdentityDto(
                "maria.gonzalez", "maria.gonzalez", new DateOnly(2026, 8, 1),
                new CurrentSprintBalanceDto(
                    new SprintRefDto("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Provisional", null),
                    32m, 20m, 60.0m,
                    new CapacityDto(1.0m, 0.8m, new CapacityBreakdownDto(10m, 1m, 1m, 0m, 0m), 64, 16),
                    "PossibleOverload", null, 2)),
            Stacks:
            [
                new PersonStackDetailDto(".NET", 3, true, 4, [new PersonRefDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Carlos López")]),
            ],
            CostReading: "InRange",
            SuggestedSquads: []);
    }
}

/// <summary>Una persona externa sin célula, con una célula sugerida.</summary>
public sealed class SuggestedSquadDtoExample : IExamplesProvider<SuggestedSquadDto>
{
    public SuggestedSquadDto GetExamples() => new(
        Guid.Parse("55555555-5555-5555-5555-555555555555"), "Pagos Instantáneos", "Low",
        "Sin equipo", 3, 0.0, 0.0);
}

public sealed class LinkDevOpsIdentityRequestExample : IExamplesProvider<LinkDevOpsIdentityRequest>
{
    public LinkDevOpsIdentityRequest GetExamples() => new("maria.gonzalez");
}
