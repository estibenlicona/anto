using Moq;
using GestionCapacidad.Application.UseCases.Squads.GetSquads;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetSquadsUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();

    private GetSquadsUseCase CreateUseCase(
        IReadOnlyList<Allocation>? allocations = null,
        IReadOnlyList<Person>? people = null)
    {
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(allocations ?? Array.Empty<Allocation>());
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(people ?? Array.Empty<Person>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Initiative>());
        return new GetSquadsUseCase(_repository.Object, _allocations.Object, _people.Object, _initiatives.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsPageOfSquads()
    {
        var squads = new[]
        {
            TestDataFactory.CreateSquad(name: "Alpha"),
            TestDataFactory.CreateSquad(name: "Beta"),
            TestDataFactory.CreateSquad(name: "Gamma"),
        };

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((squads, squads.Length));

        GetSquadsResponse response = await CreateUseCase().ExecuteAsync(new GetSquadsRequest(1, 10));

        Assert.Equal(3, response.Squads.Items.Count);
        Assert.Equal(3, response.Squads.TotalCount);
        Assert.Contains(response.Squads.Items, s => s.Name == "Alpha");
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsEmpty_WhenNoSquadsExist()
    {
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Array.Empty<Squad>(), 0));

        GetSquadsResponse response = await CreateUseCase().ExecuteAsync(new GetSquadsRequest(1, 10));

        Assert.Empty(response.Squads.Items);
        Assert.Equal(0, response.Squads.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_PassesSearchAndCriticalities_ToTheRepository()
    {
        var squads = new[] { TestDataFactory.CreateSquad(name: "Backend Platform") };
        _repository
            .Setup(r => r.GetPagedAsync(
                1, 10, "backend",
                It.Is<IReadOnlyCollection<string>>(c => c.SequenceEqual(new[] { "High", "Critical" })),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((squads, squads.Length));

        GetSquadsResponse response = await CreateUseCase()
            .ExecuteAsync(new GetSquadsRequest(1, 10, "backend", new[] { "High", "Critical" }));

        Assert.Single(response.Squads.Items);
        _repository.Verify(r => r.GetPagedAsync(
            1, 10, "backend", It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesAggregates_FromAllocationsAndPeople()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person ana = TestDataFactory.CreatePerson(name: "Ana", level: Level.Experto);
        Person beto = TestDataFactory.CreatePerson(name: "Beto", level: Level.Principiante);
        Person carla = TestDataFactory.CreatePerson(name: "Carla");
        Person dora = TestDataFactory.CreatePerson(name: "Dora");
        var people = new[] { dora, carla, beto, ana };
        var allocations = new[]
        {
            new Allocation(dora.Id, squad.Id, null, Percentage.From(50), Percentage.From(30), Percentage.From(20)),
            new Allocation(ana.Id, squad.Id, null, Percentage.From(80), Percentage.From(50), Percentage.From(30)),
            new Allocation(beto.Id, squad.Id, null, Percentage.From(100), Percentage.From(60), Percentage.From(40)),
            new Allocation(carla.Id, squad.Id, null, Percentage.From(50), Percentage.From(20), Percentage.From(30)),
        };

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new[] { squad }, 1));

        GetSquadsResponse response = await CreateUseCase(allocations, people)
            .ExecuteAsync(new GetSquadsRequest(1, 10));

        var dto = Assert.Single(response.Squads.Items);
        Assert.Equal(4, dto.MemberCount);
        // Muestra de 3, ordenada por nombre.
        Assert.Equal(["Ana", "Beto", "Carla"], dto.Members.Select(m => m.Name));
        Assert.Equal(2.8, dto.AllocatedFte);
        Assert.Equal(1.6, dto.BauFte);
        Assert.Equal(1.2, dto.TransformationFte);
        // 4 personas de 1.0 FTE (factory).
        Assert.Equal(4.0, dto.PeopleAvailableFte);
        Assert.Null(dto.ActiveInitiative);
        Assert.NotEqual(default, dto.UpdatedAtUtc);
    }
}
