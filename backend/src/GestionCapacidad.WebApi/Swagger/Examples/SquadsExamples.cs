using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class SquadDtoExample : IExamplesProvider<SquadDto>
{
    public SquadDto GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Backend Platform",
        TeamId: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        TeamName: "Ecosistema Digital",
        Criticality: "High",
        Description: "Célula responsable de la plataforma de servicios",
        CreatedAtUtc: DateTime.Parse("2025-11-01T08:00:00Z"),
        UpdatedAtUtc: DateTime.Parse("2025-11-01T08:00:00Z"),
        MemberCount: 4,
        Members:
        [
            new SquadMemberSampleDto(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Andrés Martínez"),
            new SquadMemberSampleDto(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Carlos López"),
            new SquadMemberSampleDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Isabella Moreno"),
        ],
        AllocatedFte: 2.8,
        BauFte: 1.6,
        TransformationFte: 1.2,
        PeopleAvailableFte: 3.3,
        ActiveInitiative: null);
}

public sealed class CreateSquadRequestExample : IExamplesProvider<CreateSquadRequest>
{
    public CreateSquadRequest GetExamples() => new(
        Name: "Backend Platform",
        TeamId: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        Criticality: "High",
        Description: "Célula responsable de la plataforma de servicios");
}

public sealed class CreateSquadResponseExample : IExamplesProvider<CreateSquadResponse>
{
    public CreateSquadResponse GetExamples() => new(new SquadDtoExample().GetExamples());
}

public sealed class GetSquadByIdResponseExample : IExamplesProvider<GetSquadByIdResponse>
{
    public GetSquadByIdResponse GetExamples() => new(new SquadDtoExample().GetExamples());
}

public sealed class UpdateSquadRequestExample : IExamplesProvider<UpdateSquadRequest>
{
    public UpdateSquadRequest GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Backend Platform",
        TeamId: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        Criticality: "Critical",
        Description: "Célula responsable de la plataforma y la pasarela de pagos");
}

public sealed class UpdateSquadResponseExample : IExamplesProvider<UpdateSquadResponse>
{
    public UpdateSquadResponse GetExamples() => new(new SquadDtoExample().GetExamples());
}

public sealed class SquadTeamStatsDtoExample : IExamplesProvider<SquadTeamStatsDto>
{
    public SquadTeamStatsDto GetExamples() => new(
        MemberCount: 4,
        Members:
        [
            new SquadMemberSampleDto(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Andrés Martínez"),
            new SquadMemberSampleDto(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Carlos López"),
            new SquadMemberSampleDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Isabella Moreno"),
            new SquadMemberSampleDto(Guid.Parse("55555555-5555-5555-5555-555555555555"), "María González"),
        ],
        ExpertCount: 1,
        BeginnerCount: 0,
        AllocatedFte: 2.8,
        BauFte: 1.6,
        TransformationFte: 1.2,
        PeopleAvailableFte: 3.3);
}

public sealed class SquadsStatsDtoExample : IExamplesProvider<SquadsStatsDto>
{
    public SquadsStatsDto GetExamples() => new(
        TotalCount: 5,
        WithoutPeopleCount: 1,
        AtCapacityCount: 1,
        TeamCount: 4,
        AllocatedFte: 6.4,
        BauFte: 3.5,
        TransformationFte: 2.9,
        ChapterFte: 17.3,
        ByCriticality:
        [
            new CriticalityBucketDto("Critical", 2),
            new CriticalityBucketDto("High", 1),
            new CriticalityBucketDto("Medium", 1),
            new CriticalityBucketDto("Low", 1),
        ]);
}
