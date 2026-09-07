using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Una evaluación en curso: una habilidad calificada con brecha, otra sin calificar todavía.</summary>
public sealed class AssessmentDtoExample : IExamplesProvider<AssessmentDto>
{
    public AssessmentDto GetExamples() => new(
        Id: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        PersonName: "María González",
        Position: "Backend Dev",
        Cycle: "2026-S1",
        Status: "InProgress",
        CatalogVersion: 3,
        ClosedAtUtc: null,
        Skills:
        [
            new AssessmentSkillDto(
                SkillId: Guid.Parse("55555555-5555-5555-5555-555555555555"),
                SkillName: "SQL",
                Group: "technical",
                Level: 2,
                Note: "Le falta profundidad en modelado de datos.",
                Levels:
                [
                    new AssessmentLevelDto(1, [new AssessmentCriterionDto("Escribe select simples con filtros.", true)]),
                    new AssessmentLevelDto(2, [new AssessmentCriterionDto("Escribe joins entre varias tablas.", true)]),
                    new AssessmentLevelDto(3, [new AssessmentCriterionDto("Optimiza consultas lentas con índices.", false)]),
                    new AssessmentLevelDto(4, []),
                ],
                ExpectedLevel: 3,
                Gap: 1m,
                MissingCriteria: ["Optimiza consultas lentas con índices."]),
            new AssessmentSkillDto(
                SkillId: Guid.Parse("77777777-7777-7777-7777-777777777777"),
                SkillName: "Azure",
                Group: "technical",
                Level: null,
                Note: "",
                Levels: [new AssessmentLevelDto(1, [new AssessmentCriterionDto("Despliega un recurso siguiendo una guía.", false)])],
                ExpectedLevel: 2,
                Gap: null,
                MissingCriteria: []),
        ]);
}

public sealed class SaveSkillRequestExample : IExamplesProvider<SaveSkillRequest>
{
    public SaveSkillRequest GetExamples() => new(
        2,
        [[], ["Escribe joins entre varias tablas."], [], []],
        "Le falta profundidad en modelado de datos.");
}
