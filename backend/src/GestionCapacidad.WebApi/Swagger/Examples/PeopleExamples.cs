using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;
using GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class PersonDtoExample : IExamplesProvider<PersonDto>
{
    public PersonDto GetExamples() => new(
        Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        Name: "Ana María Rodríguez",
        DocumentId: "1020304050",
        EntraObjectId: "9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f",
        UserPrincipalName: "ana.rodriguez@empresa.com",
        Position: "Backend Developer",
        Role: "Developer",
        Seniority: 3,
        SeniorityLabel: "Avanzado",
        Modality: "Remote",
        AvailableFte: 1.0f,
        MonthlyCost: 8500000m,
        StartDate: DateOnly.Parse("2024-03-01"),
        ChapterId: Guid.Parse("55555555-5555-5555-5555-555555555555"),
        ProviderId: null,
        CreatedAtUtc: DateTime.Parse("2024-03-01T08:00:00Z"),
        UpdatedAtUtc: null);
}

public sealed class CreatePersonRequestExample : IExamplesProvider<CreatePersonRequest>
{
    public CreatePersonRequest GetExamples() => new(
        Name: "Ana María Rodríguez",
        DocumentId: "1020304050",
        EntraObjectId: "9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f",
        UserPrincipalName: "ana.rodriguez@empresa.com",
        Position: "Backend Developer",
        Role: "Developer",
        Seniority: 3,
        Modality: "Remote",
        AvailableFte: 1.0f,
        MonthlyCost: 8500000m,
        StartDate: DateOnly.Parse("2024-03-01"));
}

public sealed class CreatePersonResponseExample : IExamplesProvider<CreatePersonResponse>
{
    public CreatePersonResponse GetExamples() => new(new PersonDtoExample().GetExamples());
}

public sealed class UpdatePersonRequestExample : IExamplesProvider<UpdatePersonRequest>
{
    public UpdatePersonRequest GetExamples() => new(
        Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        Name: "Ana María Rodríguez",
        DocumentId: "1020304050",
        EntraObjectId: "9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f",
        UserPrincipalName: "ana.rodriguez@empresa.com",
        Position: "Tech Lead",
        Role: "Lead",
        Seniority: 4,
        Modality: "Hybrid",
        AvailableFte: 0.8f,
        MonthlyCost: 9800000m);
}

public sealed class UpdatePersonResponseExample : IExamplesProvider<UpdatePersonResponse>
{
    public UpdatePersonResponse GetExamples() => new(new PersonDtoExample().GetExamples());
}

public sealed class AssignPersonToChapterRequestExample : IExamplesProvider<AssignPersonToChapterRequest>
{
    public AssignPersonToChapterRequest GetExamples() => new(
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        ChapterId: Guid.Parse("55555555-5555-5555-5555-555555555555"));
}

public sealed class AssignPersonToProviderRequestExample : IExamplesProvider<AssignPersonToProviderRequest>
{
    public AssignPersonToProviderRequest GetExamples() => new(
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        ProviderId: Guid.Parse("44444444-4444-4444-4444-444444444444"));
}
