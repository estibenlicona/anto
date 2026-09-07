using Moq;
using GestionCapacidad.Application.UseCases.Squads.GetSquadsStats;
using GestionCapacidad.Application.UseCases.Squads.GetSquadTeamStats;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetSquadsStatsUseCaseTests
{
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();

    [Fact]
    public async Task ExecuteAsync_ComputesTotalsAtCapacityAndBuckets()
    {
        Squad full = TestDataFactory.CreateSquad(name: "Llena", criticality: Criticality.Critical, tribe: "Equipo A");
        Squad free = TestDataFactory.CreateSquad(name: "Con margen", criticality: Criticality.High, tribe: "Equipo A");
        Squad empty = TestDataFactory.CreateSquad(name: "Vacía", criticality: Criticality.Low, tribe: "Equipo B");

        Person parttime = TestDataFactory.CreatePerson(name: "Parcial");
        parttime.UpdateAvailability(Fte.From(0.5f));
        Person fulltime = TestDataFactory.CreatePerson(name: "Completa");

        var allocations = new[]
        {
            // "Llena": persona de 0.5 FTE asignada al 100 % → asignado 1.0 ≥ disponible 0.5.
            new Allocation(parttime.Id, full.Id, null, Percentage.From(100), Percentage.From(60), Percentage.From(40)),
            // "Con margen": 1.0 disponible, 0.5 asignado.
            new Allocation(fulltime.Id, free.Id, null, Percentage.From(50), Percentage.From(30), Percentage.From(20)),
        };

        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { full, free, empty });
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { parttime, fulltime });
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(allocations);
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());

        var stats = (await new GetSquadsStatsUseCase(
            _squads.Object, _allocations.Object, _people.Object, _initiatives.Object)
            .ExecuteAsync()).Stats;

        Assert.Equal(3, stats.TotalCount);
        Assert.Equal(1, stats.WithoutPeopleCount);
        Assert.Equal(1, stats.AtCapacityCount);
        Assert.Equal(2, stats.TeamCount);
        Assert.Equal(1.5, stats.AllocatedFte);
        Assert.Equal(0.9, stats.BauFte);
        Assert.Equal(0.6, stats.TransformationFte);
        Assert.Equal(1.5, stats.ChapterFte);

        // Los 4 niveles siempre presentes, en el orden del catálogo.
        Assert.Equal(["Critical", "High", "Medium", "Low"], stats.ByCriticality.Select(b => b.Criticality));
        Assert.Equal([1, 1, 0, 1], stats.ByCriticality.Select(b => b.Count));
    }
}

public sealed class GetSquadTeamStatsUseCaseTests
{
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();

    private GetSquadTeamStatsUseCase CreateUseCase() =>
        new(_squads.Object, _allocations.Object, _people.Object, _initiatives.Object);

    [Fact]
    public async Task ExecuteAsync_ReturnsFullTeam_WithExpertAndBeginnerCounts()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person experta = TestDataFactory.CreatePerson(name: "Ana", level: Level.Experto);
        Person novato = TestDataFactory.CreatePerson(name: "Beto", level: Level.Principiante);
        Person media = TestDataFactory.CreatePerson(name: "Carla", level: Level.Avanzado);
        Person otra = TestDataFactory.CreatePerson(name: "Dora", level: Level.Competente);

        var allocations = new[]
        {
            new Allocation(experta.Id, squad.Id, null, Percentage.From(80), Percentage.From(50), Percentage.From(30)),
            new Allocation(novato.Id, squad.Id, null, Percentage.From(100), Percentage.From(60), Percentage.From(40)),
            new Allocation(media.Id, squad.Id, null, Percentage.From(50), Percentage.From(30), Percentage.From(20)),
            new Allocation(otra.Id, squad.Id, null, Percentage.From(50), Percentage.From(20), Percentage.From(30)),
        };

        _squads.Setup(r => r.GetByIdAsync(squad.Id, It.IsAny<CancellationToken>())).ReturnsAsync(squad);
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(allocations);
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { otra, media, novato, experta });
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());

        var stats = (await CreateUseCase().ExecuteAsync(new GetSquadTeamStatsRequest(squad.Id))).Stats;

        Assert.Equal(4, stats.MemberCount);
        // El equipo completo, sin la muestra de 3 del listado.
        Assert.Equal(["Ana", "Beto", "Carla", "Dora"], stats.Members.Select(m => m.Name));
        Assert.Equal(1, stats.ExpertCount);
        Assert.Equal(1, stats.BeginnerCount);
        Assert.Equal(2.8, stats.AllocatedFte);
        Assert.Equal(4.0, stats.PeopleAvailableFte);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        _squads.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateUseCase().ExecuteAsync(new GetSquadTeamStatsRequest(Guid.NewGuid())));
    }
}
