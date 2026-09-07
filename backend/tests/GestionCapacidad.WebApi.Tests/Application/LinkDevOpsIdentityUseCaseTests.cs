using GestionCapacidad.Application.UseCases.PersonDetail.LinkDevOpsIdentity;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class LinkDevOpsIdentityUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 9, 6, 0, 0, 0, TimeSpan.Zero));

    private LinkDevOpsIdentityUseCase NewUseCase() => new(_people.Object, _unitOfWork.Object, _timeProvider);

    [Fact]
    public async Task ExecuteAsync_WithUnknownPerson_Throws404()
    {
        _people.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            NewUseCase().ExecuteAsync(new LinkDevOpsIdentityCommand(Guid.NewGuid(), "u1")));
    }

    [Fact]
    public async Task ExecuteAsync_IdentityAlreadyLinkedToSomeoneElse_Throws409WithTheirName()
    {
        Person person = TestDataFactory.CreatePerson(name: "Camila Restrepo");
        Person owner = TestDataFactory.CreatePerson(name: "María González");
        owner.LinkDevOpsIdentity("u1");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _people.Setup(r => r.GetByDevOpsUserIdAsync("u1", It.IsAny<CancellationToken>())).ReturnsAsync(owner);

        ConflictException exception = await Assert.ThrowsAsync<ConflictException>(() =>
            NewUseCase().ExecuteAsync(new LinkDevOpsIdentityCommand(person.Id, "u1")));

        Assert.Contains("María González", exception.Message);
        Assert.Null(person.DevOpsUserId);
    }

    [Fact]
    public async Task ExecuteAsync_RelinkingTheSamePerson_DoesNotThrow()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        person.LinkDevOpsIdentity("u1");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _people.Setup(r => r.GetByDevOpsUserIdAsync("u1", It.IsAny<CancellationToken>())).ReturnsAsync(person);

        await NewUseCase().ExecuteAsync(new LinkDevOpsIdentityCommand(person.Id, "u1"));

        Assert.Equal("u1", person.DevOpsUserId);
    }

    [Fact]
    public async Task ExecuteAsync_WithAFreeIdentity_LinksIt()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _people.Setup(r => r.GetByDevOpsUserIdAsync("u1", It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await NewUseCase().ExecuteAsync(new LinkDevOpsIdentityCommand(person.Id, "u1"));

        Assert.Equal("u1", person.DevOpsUserId);
        Assert.NotNull(person.DevOpsIdentityLinkedAtUtc);
    }
}
