using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Una habilidad técnica completa: los cuatro niveles con criterios y dos expectativas por cargo.</summary>
public sealed class SkillDtoExample : IExamplesProvider<SkillDto>
{
    public SkillDto GetExamples() => new(
        Id: Guid.Parse("55555555-5555-5555-5555-555555555555"),
        Name: "SQL",
        Group: "technical",
        Description: "Consultas y modelado relacional.",
        Active: true,
        Levels:
        [
            new SkillLevelDto(1, ["Escribe select simples con filtros."]),
            new SkillLevelDto(2, ["Escribe joins entre varias tablas.", "Normaliza un modelo básico."]),
            new SkillLevelDto(3, ["Optimiza consultas lentas con índices.", "Diseña un modelo desde cero."]),
            new SkillLevelDto(4, []),
        ],
        Expectations:
        [
            new PositionExpectationDto("Backend Dev", 3),
            new PositionExpectationDto("Data Engineer", 4),
            new PositionExpectationDto("QA Engineer", null),
        ]);
}

public sealed class SkillsCatalogDtoExample : IExamplesProvider<SkillsCatalogDto>
{
    public SkillsCatalogDto GetExamples() => new(
        Version: 3,
        Positions: ["Backend Dev", "Data Engineer", "QA Engineer"],
        Skills: [new SkillDtoExample().GetExamples()]);
}

public sealed class UpsertSkillRequestExample : IExamplesProvider<UpsertSkillRequest>
{
    public UpsertSkillRequest GetExamples() => new("SQL", "technical", "Consultas y modelado relacional.");
}

public sealed class SetSkillActiveRequestExample : IExamplesProvider<SetSkillActiveRequest>
{
    public SetSkillActiveRequest GetExamples() => new(false);
}

/// <summary>Declarar el nivel es el caso normal; con nivel nulo se retira la exigencia del cargo.</summary>
public sealed class SetExpectationRequestExample : IExamplesProvider<SetExpectationRequest>
{
    public SetExpectationRequest GetExamples() => new("Data Engineer", 4);
}

public sealed class SetCriteriaRequestExample : IExamplesProvider<SetCriteriaRequest>
{
    public SetCriteriaRequest GetExamples() => new(
        ["Optimiza consultas lentas con índices.", "Diseña un modelo desde cero."]);
}
