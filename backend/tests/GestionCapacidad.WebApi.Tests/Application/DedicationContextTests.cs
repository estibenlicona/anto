using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DedicationContextTests
{
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<ISprintRepository> _sprints = new();
    private readonly Mock<ISprintSnapshotRepository> _snapshots = new();
    private readonly Mock<ISingleDocumentRepository<SprintConfiguration>> _settings = new();
    private readonly Mock<IAbsenceRepository> _absences = new();

    private static readonly DateOnly Today = new(2026, 8, 22);

    public DedicationContextTests()
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());
        _settings.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SprintConfiguration?)null);
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Absence>());
    }

    private static Sprint NewSprint(string name, DateOnly start, DateOnly end, int holidays = 0) =>
        new(name, start, end, holidays);

    private void HaveSprints(params Sprint[] sprints) =>
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(sprints);

    private void HaveSnapshots(params SprintSnapshot[] snapshots) =>
        _snapshots.Setup(r => r.GetByPersonIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(snapshots);

    private Task<DedicationContext> BuildAsync(IReadOnlyList<Person> people) =>
        DedicationContext.BuildAsync(
            people, _squads.Object, _allocations.Object, _initiatives.Object, _sprints.Object, _snapshots.Object,
            _settings.Object, _absences.Object, Today, CancellationToken.None);

    [Fact]
    public async Task BuildRow_PersonWithoutIdentity_IsNotEvaluable()
    {
        Person person = TestDataFactory.CreatePerson(name: "Sin Identidad");
        var sprint = NewSprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30));
        HaveSprints(sprint);
        HaveSnapshots();
        DedicationContext context = await BuildAsync([person]);

        CollaboratorDedicationRowDto row = await context.BuildRowAsync(person, sprint, CancellationToken.None);

        Assert.Equal("NotEvaluable", row.Balance.Signal);
        Assert.Equal("NoIdentity", row.Balance.NotEvaluableReason);
        Assert.False(row.HasIdentity);
        Assert.Null(row.Sprint);
    }

    [Fact]
    public async Task BuildRow_WithIdentityButNoSnapshotForChosenSprint_IsMissingSnapshot()
    {
        Person person = TestDataFactory.CreatePerson(name: "Con Identidad");
        person.LinkDevOpsIdentity("con.identidad");
        var previous = NewSprint("S17", new DateOnly(2026, 8, 3), new DateOnly(2026, 8, 16));
        var current = NewSprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30));
        HaveSprints(previous, current);

        // Tiene historia (hay snapshots de otros sprints) pero nada para el elegido.
        var oldSnapshot = new SprintSnapshot(person.Id, previous.Id);
        oldSnapshot.SetExecution(20m, 0m, 20m, 0m, 2, 0m);
        oldSnapshot.Seal(DateTime.UtcNow);
        HaveSnapshots(oldSnapshot);
        DedicationContext context = await BuildAsync([person]);

        CollaboratorDedicationRowDto row = await context.BuildRowAsync(person, current, CancellationToken.None);

        Assert.Equal("NotEvaluable", row.Balance.Signal);
        Assert.Equal("MissingSnapshot", row.Balance.NotEvaluableReason);
        Assert.NotNull(row.Sprint);
        Assert.Equal("Missing", row.Sprint!.SnapshotStatus);
    }

    [Fact]
    public async Task BuildRow_CurrentSprintNeverEntersItsOwnHistoryWindow()
    {
        Person person = TestDataFactory.CreatePerson(name: "Histórico");
        person.LinkDevOpsIdentity("historico");
        var s1 = NewSprint("S1", new DateOnly(2026, 6, 8), new DateOnly(2026, 6, 21));
        var s2 = NewSprint("S2", new DateOnly(2026, 6, 22), new DateOnly(2026, 7, 5));
        var s3 = NewSprint("S3", new DateOnly(2026, 7, 6), new DateOnly(2026, 7, 19));
        var current = NewSprint("S4-Current", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30));
        HaveSprints(s1, s2, s3, current);

        SprintSnapshot Sealed(Sprint sprint, decimal points)
        {
            var snap = new SprintSnapshot(person.Id, sprint.Id);
            snap.SetExecution(points, 0m, points, 0m, 2, 0m);
            snap.Seal(DateTime.UtcNow);
            return snap;
        }

        var currentSnapshot = new SprintSnapshot(person.Id, current.Id);
        currentSnapshot.SetExecution(22m, 0m, null, null, 2, 0m);

        HaveSnapshots(Sealed(s1, 20m), Sealed(s2, 20m), Sealed(s3, 20m), currentSnapshot);
        DedicationContext context = await BuildAsync([person]);

        CollaboratorDedicationRowDto row = await context.BuildRowAsync(person, current, CancellationToken.None);

        // La mediana histórica (20) no debe incluir el sprint actual (22): sigue en 20.
        Assert.Equal(20m, row.Reference.OwnMedian);
        Assert.Equal(3, row.Reference.SealedSprintCount);
    }

    [Fact]
    public async Task BuildRow_SquadMedian_IsAggregatedPerCollaborator_NotRawSum()
    {
        Person a = TestDataFactory.CreatePerson(name: "A");
        a.LinkDevOpsIdentity("a");
        Person b = TestDataFactory.CreatePerson(name: "B");
        b.LinkDevOpsIdentity("b");
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        var allocA = new Allocation(a.Id, squad.Id, null, Percentage.From(100), Percentage.From(50), Percentage.From(50));
        var allocB = new Allocation(b.Id, squad.Id, null, Percentage.From(100), Percentage.From(50), Percentage.From(50));

        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([squad]);
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([allocA, allocB]);

        var historic = NewSprint("S17", new DateOnly(2026, 8, 3), new DateOnly(2026, 8, 16));
        var current = NewSprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30));
        HaveSprints(historic, current);

        SprintSnapshot Sealed(Guid personId, Sprint sprint, decimal points)
        {
            var snap = new SprintSnapshot(personId, sprint.Id);
            snap.SetExecution(points, 0m, points, 0m, 1, 0m);
            snap.Seal(DateTime.UtcNow);
            return snap;
        }

        // Célula: 20 + 10 = 30 SP entre 2 personas ese sprint → 15 por colaborador.
        HaveSnapshots(Sealed(a.Id, historic, 20m), Sealed(b.Id, historic, 10m));
        _snapshots.Setup(r => r.GetByPersonIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IReadOnlyCollection<Guid> ids, CancellationToken _) =>
            {
                List<SprintSnapshot> all = [Sealed(a.Id, historic, 20m), Sealed(b.Id, historic, 10m)];
                return (IReadOnlyList<SprintSnapshot>)[.. all.Where(s => ids.Contains(s.PersonId))];
            });

        DedicationContext context = await BuildAsync([a, b]);

        CollaboratorDedicationRowDto row = await context.BuildRowAsync(a, current, CancellationToken.None);

        Assert.Equal(15m, row.Reference.SquadMedian);
    }
}
