using Moq;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.UseCases.People.GetPeopleStats;
using GestionCapacidad.Application.UseCases.People.GetTechnicalLeads;
using GestionCapacidad.Application.UseCases.People.ReplacePersonStacks;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetPeopleStatsUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();

    private static Person PersonWith(string name, Seniority seniority, float fte, params (string Name, bool Primary)[] stacks)
    {
        Person person = TestDataFactory.CreatePerson(name: name);
        person.ChangeSeniority(seniority);
        person.UpdateAvailability(Fte.From(fte));
        if (stacks.Length > 0)
        {
            person.ReplaceStacks(stacks
                .Select(s => new PersonStack(s.Name, Level.Competente, s.Primary))
                .ToList());
        }

        return person;
    }

    [Fact]
    public async Task ExecuteAsync_ComputesCountsFteBucketsSampleAndCoverage()
    {
        var people = new[]
        {
            PersonWith("Carlos", Seniority.Senior, 0.8f, (".NET", true), ("AS400", false)),
            PersonWith("Ana", Seniority.Junior, 1.0f, (".NET", true)),
            PersonWith("Beatriz", Seniority.Junior, 0.5f),
        };
        _repository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(people);

        PeopleStatsDto stats = (await new GetPeopleStatsUseCase(_repository.Object).ExecuteAsync()).Stats;

        Assert.Equal(3, stats.ActiveCount);
        Assert.Equal(2.3f, stats.FteAvailable, precision: 3);
        Assert.Equal(12f, stats.FteTarget);

        // Los tres escalones siempre presentes, aunque estén en cero.
        Assert.Equal(["Junior", "Intermediate", "Senior"], stats.BySeniority.Select(b => b.Seniority));
        Assert.Equal([2, 0, 1], stats.BySeniority.Select(b => b.Count));

        // Muestra ordenada por nombre.
        Assert.Equal(["Ana", "Beatriz", "Carlos"], stats.Sample.Select(p => p.Name));

        // .NET lo tienen dos; AS400 una sola persona: en riesgo.
        Assert.Equal(2, stats.StackCoverage.Distinct);
        Assert.Equal(["AS400"], stats.StackCoverage.AtRisk);
    }

    [Fact]
    public async Task ExecuteAsync_SampleIsCappedAtFive()
    {
        var people = Enumerable.Range(1, 8)
            .Select(i => TestDataFactory.CreatePerson(name: $"Persona {i}"))
            .ToArray();
        _repository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(people);

        PeopleStatsDto stats = (await new GetPeopleStatsUseCase(_repository.Object).ExecuteAsync()).Stats;

        Assert.Equal(5, stats.Sample.Count);
        Assert.Equal(8, stats.ActiveCount);
    }
}

public sealed class GetTechnicalLeadsUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();

    [Fact]
    public async Task ExecuteAsync_ReturnsOnlyTechnicalLeads_SortedByName()
    {
        Person leadB = TestDataFactory.CreatePerson(name: "Tomás", role: PersonRole.TechnicalLead);
        Person leadA = TestDataFactory.CreatePerson(name: "Carlos", role: PersonRole.TechnicalLead);
        Person other = TestDataFactory.CreatePerson(name: "Ana", role: PersonRole.ExpertiseLead);
        _repository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { leadB, other, leadA });

        GetTechnicalLeadsResponse response =
            await new GetTechnicalLeadsUseCase(_repository.Object).ExecuteAsync();

        Assert.Equal(["Carlos", "Tomás"], response.Leads.Select(l => l.Name));
        Assert.Equal([leadA.Id, leadB.Id], response.Leads.Select(l => l.Id));
    }
}

public sealed class ReplacePersonStacksUseCaseTests
{
    private static readonly string[] Catalog = [".NET", "Azure", "Kafka"];

    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IStackCatalog> _catalog = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ReplacePersonStacksUseCase BuildUseCase(Person person)
    {
        _catalog.SetupGet(c => c.Names).Returns(Catalog);
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _repository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new[] { person });
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        return new ReplacePersonStacksUseCase(
            _repository.Object, _allocations.Object, _catalog.Object, _unitOfWork.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ReplacesStacks_AndReturnsThePrimaryFirst()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        ReplacePersonStacksResponse response = await useCase.ExecuteAsync(new ReplacePersonStacksRequest(
            person.Id,
            [
                new PersonStackDto("Azure", 2, IsPrimary: false),
                new PersonStackDto(".NET", 3, IsPrimary: true),
            ]));

        Assert.Equal([".NET", "Azure"], response.Person.Stacks.Select(s => s.Name));
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(Guid.NewGuid(), [])));
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenStackIsOutsideTheCatalog()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(person.Id, [new PersonStackDto("COBOL", 2, IsPrimary: true)])));

        Assert.Contains("COBOL", exception.Message);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenMoreThanOnePrimary()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(person.Id,
            [
                new PersonStackDto(".NET", 3, IsPrimary: true),
                new PersonStackDto("Azure", 2, IsPrimary: true),
            ])));
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenNoPrimaryAmongStacks()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(person.Id,
            [
                new PersonStackDto(".NET", 3, IsPrimary: false),
            ])));
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenLevelIsOutOfRange()
    {
        Person person = TestDataFactory.CreatePerson();
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(person.Id, [new PersonStackDto(".NET", 5, IsPrimary: true)])));
    }

    [Fact]
    public async Task ExecuteAsync_WithEmptyList_ClearsStacks()
    {
        Person person = TestDataFactory.CreatePerson();
        person.ReplaceStacks([new PersonStack(".NET", Level.Avanzado, isPrimary: true)]);
        ReplacePersonStacksUseCase useCase = BuildUseCase(person);

        ReplacePersonStacksResponse response = await useCase.ExecuteAsync(
            new ReplacePersonStacksRequest(person.Id, []));

        Assert.Empty(response.Person.Stacks);
    }
}
