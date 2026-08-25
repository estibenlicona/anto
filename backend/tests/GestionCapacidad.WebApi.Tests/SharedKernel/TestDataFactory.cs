using Bogus;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using DomainPerson = GestionCapacidad.Domain.Entities.Person;

namespace GestionCapacidad.WebApi.Tests.SharedKernel;

public static class TestDataFactory
{
    // ── Company ───────────────────────────────────────────────────────────────

    public static CreateCompanyRequest CreateCompanyRequest(
        string? name = null,
        string? identificationNumber = null,
        string? email = null)
    {
        var faker = new Faker();
        return new CreateCompanyRequest(
            name ?? faker.Company.CompanyName(),
            identificationNumber ?? UniqueIdentificationNumber(),
            email ?? faker.Internet.Email());
    }

    public static UpdateCompanyRequest UpdateCompanyRequest(
        Guid? id = null,
        string? name = null,
        string? identificationNumber = null,
        string? email = null)
    {
        var faker = new Faker();
        return new UpdateCompanyRequest(
            id ?? Guid.NewGuid(),
            name ?? faker.Company.CompanyName(),
            identificationNumber ?? UniqueIdentificationNumber(),
            email ?? faker.Internet.Email());
    }

    public static Company CreateCompany(
        string? name = null,
        string? identificationNumber = null,
        string? email = null)
    {
        CreateCompanyRequest request = CreateCompanyRequest(name, identificationNumber, email);
        return new Company(request.Name, request.IdentificationNumber, request.Email);
    }

    // ── Squad ─────────────────────────────────────────────────────────────────

    public static CreateSquadRequest CreateSquadRequest(
        string? name = null,
        string? criticality = null,
        string? tribe = null,
        string? description = null)
    {
        var faker = new Faker();
        return new CreateSquadRequest(
            name ?? faker.Commerce.Department(),
            criticality ?? "High",
            tribe ?? faker.Commerce.Categories(1)[0],
            description);
    }

    public static UpdateSquadRequest UpdateSquadRequest(
        Guid? id = null,
        string? name = null,
        string? criticality = null,
        string? tribe = null,
        string? description = null)
    {
        var faker = new Faker();
        return new UpdateSquadRequest(
            id ?? Guid.NewGuid(),
            name ?? faker.Commerce.Department(),
            criticality ?? "Medium",
            tribe ?? faker.Commerce.Categories(1)[0],
            description);
    }

    public static Squad CreateSquad(
        string? name = null,
        Criticality? criticality = null,
        string? tribe = null,
        string? description = null)
    {
        var faker = new Faker();
        return new Squad(
            name ?? faker.Commerce.Department(),
            criticality ?? Criticality.High,
            tribe ?? faker.Commerce.Categories(1)[0],
            description);
    }

    // ── Person ────────────────────────────────────────────────────────────────

    public static CreatePersonRequest CreatePersonRequest(
        string? name = null,
        int? seniority = null,
        string? modality = null,
        float? availableFte = null)
    {
        var faker = new Faker();
        return new CreatePersonRequest(
            Name: name ?? faker.Name.FullName(),
            DocumentId: faker.Random.Replace("##########"),
            EntraObjectId: Guid.NewGuid().ToString(),
            UserPrincipalName: faker.Internet.Email(),
            Position: faker.Name.JobTitle(),
            Role: "Developer",
            Seniority: seniority ?? 3,
            Modality: modality ?? "Hybrid",
            AvailableFte: availableFte ?? 1.0f,
            MonthlyCost: faker.Random.Decimal(3000, 10000),
            StartDate: new DateOnly(2023, 1, 1));
    }

    public static UpdatePersonRequest UpdatePersonRequest(
        Guid? id = null,
        string? name = null,
        int? seniority = null,
        string? modality = null,
        float? availableFte = null)
    {
        var faker = new Faker();
        return new UpdatePersonRequest(
            Id: id ?? Guid.NewGuid(),
            Name: name ?? faker.Name.FullName(),
            DocumentId: faker.Random.Replace("##########"),
            EntraObjectId: Guid.NewGuid().ToString(),
            UserPrincipalName: faker.Internet.Email(),
            Position: faker.Name.JobTitle(),
            Role: "Developer",
            Seniority: seniority ?? 3,
            Modality: modality ?? "Hybrid",
            AvailableFte: availableFte ?? 1.0f,
            MonthlyCost: faker.Random.Decimal(3000, 10000));
    }

    public static DomainPerson CreatePerson(
        string? name = null,
        Seniority? seniority = null,
        Modality? modality = null,
        string? position = null)
    {
        var faker = new Faker();
        return new DomainPerson(
            name: name ?? faker.Name.FullName(),
            documentId: faker.Random.Replace("##########"),
            entraObjectId: Guid.NewGuid().ToString(),
            userPrincipalName: faker.Internet.Email(),
            position: position ?? faker.Name.JobTitle(),
            role: "Developer",
            seniority: seniority ?? Seniority.Avanzado,
            modality: modality ?? Modality.Hybrid,
            availableFte: Fte.FullTime,
            monthlyCost: 5000m,
            startDate: new DateOnly(2023, 1, 1));
    }

    // ── Shared ────────────────────────────────────────────────────────────────

    public static string UniqueIdentificationNumber() =>
        Guid.NewGuid().ToString("N")[..12];
}
