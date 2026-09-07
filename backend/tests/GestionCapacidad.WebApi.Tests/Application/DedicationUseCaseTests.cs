using GestionCapacidad.Application.UseCases.Dedication.GetCollaboratorDetail;
using GestionCapacidad.Application.UseCases.Dedication.GetCollaborators;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DedicationUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<ISprintRepository> _sprints = new();
    private readonly Mock<ISprintSnapshotRepository> _snapshots = new();
    private readonly Mock<ISingleDocumentRepository<SprintConfiguration>> _settings = new();
    private readonly Mock<IAbsenceRepository> _absences = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 8, 22, 0, 0, 0, TimeSpan.Zero));

    private readonly Person _maria = TestDataFactory.CreatePerson(name: "María González", position: "Backend Dev");
    private readonly Sprint _current = new("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 0);

    public DedicationUseCaseTests()
    {
        _maria.LinkDevOpsIdentity("maria.gonzalez");
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_maria]);
        _people.Setup(r => r.GetByIdAsync(_maria.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_maria);
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<SprintSnapshot>());
        _settings.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SprintConfiguration?)null);
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Absence>());
    }

    private GetCollaboratorsUseCase NewListUseCase() => new(
        _people.Object, _squads.Object, _allocations.Object, _initiatives.Object, _sprints.Object,
        _snapshots.Object, _settings.Object, _absences.Object, _timeProvider);

    private GetCollaboratorDetailUseCase NewDetailUseCase() => new(
        _people.Object, _squads.Object, _allocations.Object, _initiatives.Object, _sprints.Object,
        _snapshots.Object, _settings.Object, _absences.Object, _timeProvider);

    // ── GetCollaborators ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetCollaborators_WithoutSprint_ResolvesTheCurrentOne()
    {
        GetCollaboratorsResponse response = await NewListUseCase().ExecuteAsync(
            new GetCollaboratorsRequest(null, 1, 20, null, null));

        Assert.Equal("S18", response.List.Sprint!.Name);
        Assert.Equal(1, response.List.Summary.Total);
    }

    [Fact]
    public async Task GetCollaborators_WithInvalidSprintName_Throws400()
    {
        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewListUseCase().ExecuteAsync(new GetCollaboratorsRequest("no-existe", 1, 20, null, null)));
    }

    [Fact]
    public async Task GetCollaborators_SummaryCountsEveryNotEvaluableReasonSeparately()
    {
        var withoutIdentity = TestDataFactory.CreatePerson(name: "Sin Identidad");
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_maria, withoutIdentity]);

        GetCollaboratorsResponse response = await NewListUseCase().ExecuteAsync(
            new GetCollaboratorsRequest(null, 1, 20, null, null));

        Assert.Equal(1, response.List.Summary.NoIdentity);
        Assert.Equal(2, response.List.Summary.Total);
    }

    [Fact]
    public async Task GetCollaborators_FilterBySquad_DoesNotChangeTheSummary()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        var allocation = new Allocation(
            _maria.Id, squad.Id, null,
            Percentage.From(100), Percentage.From(50), Percentage.From(50));
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([squad]);
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([allocation]);

        GetCollaboratorsResponse withoutFilter = await NewListUseCase().ExecuteAsync(
            new GetCollaboratorsRequest(null, 1, 20, null, null));
        GetCollaboratorsResponse withFilter = await NewListUseCase().ExecuteAsync(
            new GetCollaboratorsRequest(null, 1, 20, null, [Guid.NewGuid()]));

        Assert.Equal(withoutFilter.List.Summary.Total, withFilter.List.Summary.Total);
        Assert.Empty(withFilter.List.Items);
    }

    // ── GetCollaboratorDetail ─────────────────────────────────────────────────

    [Fact]
    public async Task GetCollaboratorDetail_WithUnknownPerson_Throws404()
    {
        await Assert.ThrowsAsync<NotFoundException>(() =>
            NewDetailUseCase().ExecuteAsync(new GetCollaboratorDetailRequest(Guid.NewGuid(), null)));
    }

    [Fact]
    public async Task GetCollaboratorDetail_TrendIncludesEverySprint()
    {
        var previous = new Sprint("S17", new DateOnly(2026, 8, 3), new DateOnly(2026, 8, 16), 0);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([previous, _current]);

        GetCollaboratorDetailResponse response = await NewDetailUseCase().ExecuteAsync(
            new GetCollaboratorDetailRequest(_maria.Id, null));

        Assert.Equal(2, response.Detail.Sprints.Count);
        Assert.NotNull(response.Detail.SelectedSprint);
        Assert.Equal("S18", response.Detail.SelectedSprint!.Name);
    }
}
