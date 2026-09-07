using GestionCapacidad.Application.ControlTower;
using GestionCapacidad.Application.UseCases.ControlTower.GetChapterCapacityOverview;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetChapterCapacityOverviewUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_ReturnsTheSameNumbersAsTheCalculator()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person person = TestDataFactory.CreatePerson(name: "María");
        var allocation = new Allocation(person.Id, squad.Id, null, Percentage.From(60), Percentage.From(30), Percentage.From(30));

        var people = new Mock<IPersonRepository>();
        people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([person]);
        var squads = new Mock<ISquadRepository>();
        squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([squad]);
        var allocations = new Mock<IAllocationRepository>();
        allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([allocation]);
        var initiatives = new Mock<IInitiativeRepository>();
        initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());

        var useCase = new GetChapterCapacityOverviewUseCase(people.Object, squads.Object, allocations.Object, initiatives.Object);

        var response = await useCase.ExecuteAsync();

        var expected = ChapterCapacityOverviewCalculator.Compute([person], [squad], [allocation], []);
        Assert.Equal(expected.ChapterFte, response.Overview.ChapterFte);
        Assert.Equal(expected.BauFte, response.Overview.BauFte);
        Assert.Equal(expected.TransformationFte, response.Overview.TransformationFte);
        Assert.Equal(expected.FreeFte, response.Overview.FreeFte);
        Assert.Equal(expected.PeopleTotal, response.Overview.PeopleTotal);
        Assert.Equal(expected.PeopleUnassigned, response.Overview.PeopleUnassigned);
        Assert.Equal(expected.PeoplePartial, response.Overview.PeoplePartial);
        Assert.Equal(expected.SquadsAtCapacity, response.Overview.SquadsAtCapacity);
        Assert.Equal(expected.SquadsWithoutTeam, response.Overview.SquadsWithoutTeam);
        Assert.Equal(expected.People, response.Overview.People);
        Assert.Equal(expected.Squads, response.Overview.Squads);
    }
}
