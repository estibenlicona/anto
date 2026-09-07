using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.UseCases.PersonDetail.GetPersonDetail;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetPersonDetailUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ICompanyRepository> _companies = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IExpertiseLineRepository> _lines = new();
    private readonly Mock<IChapterCatalog> _chapters = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<ISprintRepository> _sprints = new();
    private readonly Mock<ISprintSnapshotRepository> _snapshots = new();
    private readonly Mock<ISingleDocumentRepository<SprintConfiguration>> _settings = new();
    private readonly Mock<IAbsenceRepository> _absences = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 9, 6, 0, 0, 0, TimeSpan.Zero));

    public GetPersonDetailUseCaseTests()
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _lines.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<ExpertiseLine>());
        _chapters.Setup(c => c.Entries).Returns(Array.Empty<ChapterCatalogEntry>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());
        _sprints.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Sprint>());
        _snapshots.Setup(r => r.GetByPersonIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<SprintSnapshot>());
        _settings.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SprintConfiguration?)null);
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Absence>());
    }

    private GetPersonDetailUseCase NewUseCase() => new(
        _people.Object, _companies.Object, _squads.Object, _allocations.Object, _lines.Object, _chapters.Object,
        _initiatives.Object, _sprints.Object, _snapshots.Object, _settings.Object, _absences.Object, _timeProvider);

    private void HavePeople(params Person[] people)
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(people);
        foreach (Person person in people)
        {
            _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        }
    }

    [Fact]
    public async Task ExecuteAsync_WithUnknownPerson_Throws404()
    {
        _people.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            NewUseCase().ExecuteAsync(new GetPersonDetailRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task ExecuteAsync_ExternalPerson_HasProviderName()
    {
        Person external = TestDataFactory.CreatePerson(name: "Paula Ramírez");
        var company = new Company("GFT", "900111222", "contacto@gft.com");
        external.AssignToProvider(company.Id);
        HavePeople(external);
        _companies.Setup(r => r.GetByIdAsync(company.Id, It.IsAny<CancellationToken>())).ReturnsAsync(company);

        GetPersonDetailResponse response = await NewUseCase().ExecuteAsync(new GetPersonDetailRequest(external.Id));

        Assert.Equal("GFT", response.Detail.ProviderName);
    }

    [Fact]
    public async Task ExecuteAsync_InternalPerson_HasNoProviderName()
    {
        Person internalPerson = TestDataFactory.CreatePerson(name: "María González");
        HavePeople(internalPerson);

        GetPersonDetailResponse response = await NewUseCase().ExecuteAsync(new GetPersonDetailRequest(internalPerson.Id));

        Assert.Null(response.Detail.ProviderName);
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithoutIdentity_RespondsDevOpsIdentityNull()
    {
        Person person = TestDataFactory.CreatePerson(name: "Sin Identidad");
        HavePeople(person);

        GetPersonDetailResponse response = await NewUseCase().ExecuteAsync(new GetPersonDetailRequest(person.Id));

        Assert.Null(response.Detail.DevOpsIdentity);
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithIdentityButNoCurrentSprint_RespondsCurrentSprintNull()
    {
        Person person = TestDataFactory.CreatePerson(name: "Con Identidad");
        person.LinkDevOpsIdentity("con.identidad");
        HavePeople(person);

        GetPersonDetailResponse response = await NewUseCase().ExecuteAsync(new GetPersonDetailRequest(person.Id));

        Assert.NotNull(response.Detail.DevOpsIdentity);
        Assert.Null(response.Detail.DevOpsIdentity!.CurrentSprint);
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithoutChapterOrExpertiseLine_RespondsBothPairsNull()
    {
        Person person = TestDataFactory.CreatePerson(name: "Sin Chapter Ni Línea");
        HavePeople(person);

        GetPersonDetailResponse response = await NewUseCase().ExecuteAsync(new GetPersonDetailRequest(person.Id));

        Assert.Null(response.Detail.ChapterName);
        Assert.Null(response.Detail.ChapterLeadName);
        Assert.Null(response.Detail.ExpertiseLineName);
        Assert.Null(response.Detail.ExpertiseLineLeadName);
    }
}
