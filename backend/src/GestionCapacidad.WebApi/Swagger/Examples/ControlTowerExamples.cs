using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>Una persona sin célula, una de dedicación parcial, una célula sin equipo y una al tope.</summary>
public sealed class CapacityOverviewDtoExample : IExamplesProvider<CapacityOverviewDto>
{
    public CapacityOverviewDto GetExamples() => new(
        ChapterFte: 18.0,
        BauFte: 7.5,
        TransformationFte: 5.0,
        FreeFte: 5.5,
        PeopleTotal: 18,
        PeopleUnassigned: 3,
        PeoplePartial: 4,
        SquadsAtCapacity: 1,
        SquadsWithoutTeam: 1,
        People:
        [
            new OverviewPersonDto(
                Guid.Parse("11111111-1111-1111-1111-111111111111"), "Diego Salazar", "Backend Dev", "Junior", 1.0,
                null, 100m),
            new OverviewPersonDto(
                Guid.Parse("22222222-2222-2222-2222-222222222222"), "Isabella Moreno", "Frontend Dev", "Intermedio", 0.5,
                new OverviewAllocationDto(
                    Guid.Parse("33333333-3333-3333-3333-333333333333"), Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    "Backend Platform", 50m, 30m, 20m),
                50m),
        ],
        Squads:
        [
            new OverviewSquadDto(
                Guid.Parse("55555555-5555-5555-5555-555555555555"), "Pagos Instantáneos", "Low", 0, 0.0, 0.0, 0.0, 0.0),
            new OverviewSquadDto(
                Guid.Parse("44444444-4444-4444-4444-444444444444"), "Backend Platform", "High", 4, 3.6, 3.5, 2.1, 1.5),
        ]);
}
