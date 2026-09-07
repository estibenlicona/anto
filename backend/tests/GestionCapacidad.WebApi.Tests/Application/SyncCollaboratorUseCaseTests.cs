using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Application.UseCases.Dedication.SyncAllCollaborators;
using GestionCapacidad.Application.UseCases.Dedication.SyncCollaborator;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SyncCollaboratorUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISprintRepository> _sprints = new();
    private readonly Mock<ISprintSnapshotRepository> _snapshots = new();
    private readonly Mock<IAzureDevOpsClient> _client = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 8, 22, 0, 0, 0, TimeSpan.Zero));

    private readonly Sprint _current = new("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 0);

    private SyncCollaboratorUseCase NewUseCase() =>
        new(_people.Object, _sprints.Object, _snapshots.Object, _client.Object, _unitOfWork.Object, _timeProvider);

    private static AzureDevOpsSyncDataDto EmptyData() => new([], []);

    [Fact]
    public async Task ExecuteAsync_UnknownPerson_Throws404()
    {
        _people.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(Guid.NewGuid())));
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithoutIdentity_Throws400()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);

        await Assert.ThrowsAsync<BadRequestException>(() => NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id)));
    }

    [Fact]
    public async Task ExecuteAsync_NoCurrentSprint_Throws400()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Sprint>());

        await Assert.ThrowsAsync<BadRequestException>(() => NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id)));
    }

    [Fact]
    public async Task ExecuteAsync_ClientFails_PropagatesExternalServiceUnavailable()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(person.Id, _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SprintSnapshot?)null);
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                "maria.gonzalez", _current.StartDate, _current.EndDate, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ExternalServiceUnavailableException("Azure DevOps no respondió"));

        await Assert.ThrowsAsync<ExternalServiceUnavailableException>(
            () => NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id)));
    }

    [Fact]
    public async Task ExecuteAsync_NoExistingSnapshot_CreatesOne()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(person.Id, _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SprintSnapshot?)null);
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                "maria.gonzalez", _current.StartDate, _current.EndDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyData());

        SyncCollaboratorResponse response = await NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id));

        Assert.Equal(_timeProvider.GetUtcNow().UtcDateTime, response.Result.LastSyncedAt);
        _snapshots.Verify(r => r.AddAsync(It.IsAny<SprintSnapshot>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ExistingProvisionalSnapshot_UpdatesIt()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        var existing = new SprintSnapshot(person.Id, _current.Id);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(person.Id, _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                "maria.gonzalez", _current.StartDate, _current.EndDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyData());

        await NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id));

        _snapshots.Verify(r => r.Update(existing), Times.Once);
        _snapshots.Verify(r => r.AddAsync(It.IsAny<SprintSnapshot>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_SealedSnapshot_DoesNotTouchItAndStillSucceeds()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        var sealedSnapshot = new SprintSnapshot(person.Id, _current.Id);
        sealedSnapshot.SetExecution(10m, 0m, 9m, 1m, 2, 0m);
        sealedSnapshot.Seal(DateTime.UtcNow);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(person.Id, _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sealedSnapshot);

        SyncCollaboratorResponse response = await NewUseCase().ExecuteAsync(new SyncCollaboratorCommand(person.Id));

        Assert.Equal(_timeProvider.GetUtcNow().UtcDateTime, response.Result.LastSyncedAt);
        _client.Verify(
            c => c.GetCollaboratorSyncDataAsync(
                It.IsAny<string>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()),
            Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}

public sealed class SyncAllCollaboratorsUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISprintRepository> _sprints = new();
    private readonly Mock<ISprintSnapshotRepository> _snapshots = new();
    private readonly Mock<IAzureDevOpsClient> _client = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 8, 22, 0, 0, 0, TimeSpan.Zero));

    private readonly Sprint _current = new("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 0);

    private SyncAllCollaboratorsUseCase NewUseCase() => new(
        _people.Object,
        new SyncCollaboratorUseCase(_people.Object, _sprints.Object, _snapshots.Object, _client.Object, _unitOfWork.Object, _timeProvider),
        _timeProvider);

    [Fact]
    public async Task ExecuteAsync_NoOneLinked_Returns200()
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());

        SyncAllCollaboratorsResponse response = await NewUseCase().ExecuteAsync();

        Assert.Equal(_timeProvider.GetUtcNow().UtcDateTime, response.Result.LastSyncedAt);
    }

    [Fact]
    public async Task ExecuteAsync_AllFail_PropagatesExternalServiceUnavailable()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("maria.gonzalez");
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([person]);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(person.Id, _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SprintSnapshot?)null);
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                It.IsAny<string>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ExternalServiceUnavailableException("Azure DevOps no respondió"));

        await Assert.ThrowsAsync<ExternalServiceUnavailableException>(() => NewUseCase().ExecuteAsync());
    }

    [Fact]
    public async Task ExecuteAsync_OneFailsOneSucceeds_Returns200()
    {
        Person ok = TestDataFactory.CreatePerson(name: "María González");
        ok.LinkDevOpsIdentity("maria.gonzalez");
        Person fails = TestDataFactory.CreatePerson(name: "Carlos López");
        fails.LinkDevOpsIdentity("carlos.lopez");
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([ok, fails]);
        _people.Setup(r => r.GetByIdAsync(ok.Id, It.IsAny<CancellationToken>())).ReturnsAsync(ok);
        _people.Setup(r => r.GetByIdAsync(fails.Id, It.IsAny<CancellationToken>())).ReturnsAsync(fails);
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_current]);
        _snapshots.Setup(r => r.GetByPersonAndSprintAsync(It.IsAny<Guid>(), _current.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SprintSnapshot?)null);
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                "maria.gonzalez", It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AzureDevOpsSyncDataDto([], []));
        _client.Setup(c => c.GetCollaboratorSyncDataAsync(
                "carlos.lopez", It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ExternalServiceUnavailableException("Azure DevOps no respondió"));

        SyncAllCollaboratorsResponse response = await NewUseCase().ExecuteAsync();

        Assert.Equal(_timeProvider.GetUtcNow().UtcDateTime, response.Result.LastSyncedAt);
    }
}
