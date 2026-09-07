using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Un listado con una fila en posible sobreasignación: capacidad con descuento, demanda fuera de tolerancia, foco de dos iniciativas.</summary>
public sealed class CollaboratorDedicationListDtoExample : IExamplesProvider<CollaboratorDedicationListDto>
{
    public CollaboratorDedicationListDto GetExamples()
    {
        var person = new DedicationPersonDto(
            Guid.Parse("11111111-1111-1111-1111-111111111111"), "María González", "Backend Dev", "Intermedio", null, 1.0m);

        var allocation = new DedicationAllocationDto(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "Backend Platform",
            new DedicationActiveInitiativeDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Kafka Migration", "M"),
            80m, 50m, 30m);

        var capacity = new CapacityDto(
            1.0m, 0.8m, new CapacityBreakdownDto(10m, 1m, 1m, 0m, 0m), 64, 16);

        var execution = new SprintExecutionDto(32m, null, null, null, null, null);

        var reference = new ReferenceDto(20m, 20m, 6, true, 12m, 60.0m, 55.0m);

        List<ConcurrentInitiativeDto> initiatives =
        [
            new("E-201", "Rediseño checkout", "I-9", "Payment Engine v2", 20m),
            new("E-202", "Migración cache", null, null, 12m),
        ];

        var multitasking = new MultitaskingDto(2, initiatives, 5, 3);

        var balance = new BalanceSignalDto(
            "PossibleOverload", 2, 0, "SameDirection", null,
            [
                new BalanceEvidenceDto("demandVsOwnHistory", "Over", 60.0m, 25m, true),
                new BalanceEvidenceDto("demandPerAvailableFte", "Over", 55.0m, 25m, true),
                new BalanceEvidenceDto("completion", "Unknown", null, null, false),
                new BalanceEvidenceDto("carryOver", "Unknown", null, null, false),
                new BalanceEvidenceDto("unplannedWork", "Neutral", 0m, 20m, false),
                new BalanceEvidenceDto("multitasking", "Neutral", 2, 3, false),
            ]);

        var row = new CollaboratorDedicationRowDto(
            person, allocation, true,
            new SprintRefDto("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Provisional", null),
            capacity, execution, reference, multitasking, initiatives, balance);

        var summary = new CollaboratorDedicationSummaryDto(
            18, 3, 1, 10, 4, 2, 1, 1,
            [new DedicationPersonRefDto(person.Id, person.Name)],
            [new DedicationPersonRefDto(Guid.Parse("55555555-5555-5555-5555-555555555555"), "Mateo Vargas")]);

        var sprint = new ListSprintDto("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), true, "S17", null);

        return new CollaboratorDedicationListDto([row], 1, 20, 18, 1, summary, sprint, new DedicationSettingsDto(6, 3, 80m), null);
    }
}

/// <summary>Un detalle con tendencia de varios sprints, uno de ellos sin snapshot.</summary>
public sealed class CollaboratorDedicationDetailDtoExample : IExamplesProvider<CollaboratorDedicationDetailDto>
{
    public CollaboratorDedicationDetailDto GetExamples()
    {
        var person = new DedicationPersonDto(
            Guid.Parse("11111111-1111-1111-1111-111111111111"), "María González", "Backend Dev", "Intermedio", null, 1.0m);

        var allocation = new DedicationAllocationDto(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "Backend Platform",
            new DedicationActiveInitiativeDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Kafka Migration", "M"),
            80m, 50m, 30m);

        List<SprintTrendPointDto> trend =
        [
            new("S16", new DateOnly(2026, 7, 20), new DateOnly(2026, 8, 2), "Sealed", new DateTime(2026, 8, 2, 23, 0, 0, DateTimeKind.Utc),
                false, new SprintExecutionDto(20m, 20m, 0m, 100.0m, 0m, 0m), new SprintActivityTotalsDto(14, 2, 3)),
            new("S17", new DateOnly(2026, 8, 3), new DateOnly(2026, 8, 16), "Missing", null,
                false, new SprintExecutionDto(0m, null, null, null, null, null), new SprintActivityTotalsDto(0, 0, 0)),
            new("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Provisional", null,
                true, new SprintExecutionDto(32m, null, null, null, null, null), new SprintActivityTotalsDto(9, 1, 2)),
        ];

        List<ConcurrentInitiativeDto> initiatives =
        [
            new("E-201", "Rediseño checkout", "I-9", "Payment Engine v2", 20m),
            new("E-202", "Migración cache", null, null, 12m),
        ];

        var balance = new BalanceSignalDto(
            "PossibleOverload", 2, 0, "SameDirection", null,
            [
                new BalanceEvidenceDto("demandVsOwnHistory", "Over", 60.0m, 25m, true),
                new BalanceEvidenceDto("demandPerAvailableFte", "Over", 55.0m, 25m, true),
                new BalanceEvidenceDto("completion", "Unknown", null, null, false),
                new BalanceEvidenceDto("carryOver", "Unknown", null, null, false),
                new BalanceEvidenceDto("unplannedWork", "Neutral", 0m, 20m, false),
                new BalanceEvidenceDto("multitasking", "Neutral", 2, 3, false),
            ]);

        var selected = new SelectedSprintDto(
            "S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Provisional", null,
            new CapacityDto(1.0m, 0.8m, new CapacityBreakdownDto(10m, 1m, 1m, 0m, 0m), 64, 16),
            new SprintExecutionDto(32m, null, null, null, null, null),
            new UnplannedWorkDto(32m, 0m, 32m, 0m),
            new MultitaskingDto(2, initiatives, 5, 3),
            new ReferenceDto(20m, 20m, 6, true, 12m, 60.0m, 55.0m),
            balance,
            [
                new WorkItemDto(
                    "WI-101", 101, "Rediseño del checkout", "Initiative", "E-201", "Rediseño checkout",
                    "I-9", "Payment Engine v2", 8m, "Active", false, "Backend Platform", "https://dev.azure.com/wi/101"),
            ],
            [new ActivityDayDto(new DateOnly(2026, 8, 18), 4, 1, 1)]);

        return new CollaboratorDedicationDetailDto(
            person, allocation, true, new DedicationSettingsDto(6, 3, 80m), null, trend, selected);
    }
}
