using Moq;
using GestionCapacidad.Application.UseCases.Teams.GetTeams;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetTeamsUseCaseTests
{
    private readonly Mock<ITeamRepository> _repository = new();
    private readonly Mock<ISquadRepository> _squads = new();

    private GetTeamsUseCase CreateUseCase(IReadOnlyList<Squad>? squads = null)
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(squads ?? Array.Empty<Squad>());
        return new GetTeamsUseCase(_repository.Object, _squads.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsPageOfTeams()
    {
        var teams = new[]
        {
            TestDataFactory.CreateTeam(name: "Alpha"),
            TestDataFactory.CreateTeam(name: "Beta"),
        };

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((teams, teams.Length));

        GetTeamsResponse response = await CreateUseCase().ExecuteAsync(new GetTeamsRequest(1, 10));

        Assert.Equal(2, response.Teams.Items.Count);
        Assert.Equal(2, response.Teams.TotalCount);
        Assert.Contains(response.Teams.Items, t => t.Name == "Alpha");
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsEmpty_WhenNoTeamsExist()
    {
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Array.Empty<Team>(), 0));

        GetTeamsResponse response = await CreateUseCase().ExecuteAsync(new GetTeamsRequest(1, 10));

        Assert.Empty(response.Teams.Items);
        Assert.Equal(0, response.Teams.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesSquadCount_PerTeam()
    {
        Team team = TestDataFactory.CreateTeam(name: "Ecosistema Digital");
        var squads = new[]
        {
            TestDataFactory.CreateSquad(teamId: team.Id),
            TestDataFactory.CreateSquad(teamId: team.Id),
            TestDataFactory.CreateSquad(),
        };

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new[] { team }, 1));

        GetTeamsResponse response = await CreateUseCase(squads).ExecuteAsync(new GetTeamsRequest(1, 10));

        var dto = Assert.Single(response.Teams.Items);
        Assert.Equal(2, dto.SquadCount);
    }

    [Fact]
    public async Task ExecuteAsync_PassesSearch_ToTheRepository()
    {
        var teams = new[] { TestDataFactory.CreateTeam(name: "Ecosistema Digital") };
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, "ecosistema", It.IsAny<CancellationToken>()))
            .ReturnsAsync((teams, teams.Length));

        GetTeamsResponse response = await CreateUseCase().ExecuteAsync(new GetTeamsRequest(1, 10, "ecosistema"));

        Assert.Single(response.Teams.Items);
    }
}
