using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Una matriz de dos personas y dos habilidades: una brecha crítica, una al nivel.</summary>
public sealed class SpanMatrixDtoExample : IExamplesProvider<SpanMatrixDto>
{
    public SpanMatrixDto GetExamples()
    {
        var sql = new SpanSkillDto(Guid.Parse("55555555-5555-5555-5555-555555555555"), "SQL", "technical");
        var comunicacion = new SpanSkillDto(Guid.Parse("66666666-6666-6666-6666-666666666666"), "Comunicación", "human");

        return new SpanMatrixDto(
            [sql, comunicacion],
            [
                new SpanPersonDto(
                    Guid.Parse("11111111-1111-1111-1111-111111111111"), "María González", "Backend Dev", true,
                    [new SpanCellDto(sql.SkillId, 1, 3, 2m), new SpanCellDto(comunicacion.SkillId, 2, 2, 0m)]),
                new SpanPersonDto(
                    Guid.Parse("22222222-2222-2222-2222-222222222222"), "Sin Evaluar", "QA Engineer", false,
                    [new SpanCellDto(sql.SkillId, null, 2, null), new SpanCellDto(comunicacion.SkillId, null, null, null)]),
            ]);
    }
}

/// <summary>El resumen del span: brechas críticas, cobertura, riesgo, tendencia y pendientes.</summary>
public sealed class SpanSummaryDtoExample : IExamplesProvider<SpanSummaryDto>
{
    public SpanSummaryDto GetExamples() => new(
        TotalGaps: 5,
        CriticalGaps: 2,
        EvaluatedPeople: 14,
        TotalPeople: 18,
        PeopleAtRisk: [new SpanPersonRefDto(Guid.Parse("11111111-1111-1111-1111-111111111111"), "María González", 3)],
        PreviousCycle: new SpanCyclePointDto("2025-S2", 6),
        Trend: [new SpanCyclePointDto("2025-S2", 6), new SpanCyclePointDto("2026-S1", 5)],
        TopSkills:
        [
            new SpanFocusSkillDto(Guid.Parse("55555555-5555-5555-5555-555555555555"), "SQL", 4m, 2, 3),
        ],
        Pending: new SpanPendingDto(4, 1, 1, 2));
}

/// <summary>El plan de una persona con una brecha real y una acción en curso.</summary>
public sealed class PersonPlanDtoExample : IExamplesProvider<PersonPlanDto>
{
    public PersonPlanDto GetExamples() => new(
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        PersonName: "María González",
        Position: "Backend Dev",
        AssessmentClosedAtUtc: new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
        Cycle: "2026-S1",
        Skills:
        [
            new PlanSkillDto(
                Guid.Parse("55555555-5555-5555-5555-555555555555"), "SQL", "technical", 2, 3, 1m,
                ["Escribe select simples con filtros.", "Escribe joins entre varias tablas."], 2,
                ["Optimiza consultas lentas con índices."], 1,
                "Le falta profundidad en modelado de datos."),
        ],
        Actions:
        [
            new PlanActionDto(
                Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Guid.Parse("55555555-5555-5555-5555-555555555555"),
                "SQL", 2, 3, "2026-12", "Curso avanzado de modelado relacional", "InProgress"),
        ]);
}

public sealed class CreatePlanActionRequestExample : IExamplesProvider<CreatePlanActionRequest>
{
    public CreatePlanActionRequest GetExamples() => new(
        Guid.Parse("55555555-5555-5555-5555-555555555555"), 3, "2026-12", "Curso avanzado de modelado relacional");
}

public sealed class SetPlanActionStatusRequestExample : IExamplesProvider<SetPlanActionStatusRequest>
{
    public SetPlanActionStatusRequest GetExamples() => new("Done");
}
