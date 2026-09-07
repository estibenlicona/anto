using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class ExpertiseLineDtoExample : IExamplesProvider<ExpertiseLineDto>
{
    public ExpertiseLineDto GetExamples() => new(
        Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        Name: "Backend",
        Code: "BE",
        Description: "Desarrollo de servicios y APIs.",
        Status: "Active",
        Lead: new LineLeadDto(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Carlos López"),
        PeopleCount: 4,
        AvailableFte: 3.8);
}

/// <summary>Una línea completa: lead, varias personas, una con asignación a célula.</summary>
public sealed class ExpertiseLineDetailDtoExample : IExamplesProvider<ExpertiseLineDetailDto>
{
    public ExpertiseLineDetailDto GetExamples() => new(
        Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        Name: "Backend",
        Code: "BE",
        Description: "Desarrollo de servicios y APIs.",
        Status: "Active",
        Lead: new LineLeadDto(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Carlos López"),
        PeopleCount: 2,
        AvailableFte: 1.8,
        People:
        [
            new LinePersonDto(
                Guid.Parse("22222222-2222-2222-2222-222222222222"), "Carlos López", "Arquitecto", 4, "Experto", 0.8, true,
                new LinePersonAllocationDto(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Backend Platform", 100m)),
            new LinePersonDto(
                Guid.Parse("44444444-4444-4444-4444-444444444444"), "María González", "Backend Dev", 3, "Intermedio", 1.0, false,
                null),
        ],
        Capacity: new LineCapacityDto(2, 1.8, 0.8, 1.0, 55.6));
}

/// <summary>El roster completo del chapter, con una persona sin línea.</summary>
public sealed class RosterPersonDtoExample : IExamplesProvider<RosterPersonDto>
{
    public RosterPersonDto GetExamples() => new(
        Guid.Parse("55555555-5555-5555-5555-555555555555"), "Sofía Herrera", "Scrum Master", 3, "Intermedio", 1.0, null);
}

public sealed class UpsertExpertiseLineRequestExample : IExamplesProvider<UpsertExpertiseLineRequest>
{
    public UpsertExpertiseLineRequest GetExamples() => new("Backend", "BE", "Desarrollo de servicios y APIs.");
}

public sealed class SetLineLeadRequestExample : IExamplesProvider<SetLineLeadRequest>
{
    public SetLineLeadRequest GetExamples() => new(Guid.Parse("22222222-2222-2222-2222-222222222222"));
}

public sealed class AddLinePeopleRequestExample : IExamplesProvider<AddLinePeopleRequest>
{
    public AddLinePeopleRequest GetExamples() => new([Guid.Parse("44444444-4444-4444-4444-444444444444")]);
}
