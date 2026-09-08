using Moq;
using GestionCapacidad.Application.UseCases.Teams.GetTeamById;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetTeamByIdUseCaseTests
{
    private readonly Mock<ITeamRepository> _repository = new();
    private readonly Mock<ISquadRepository> _squads = new();

    private GetTeamByIdUseCase CreateUseCase(IReadOnlyList<Squad>? squads = null)
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(squads ?? Array.Empty<Squad>());
        return new GetTeamByIdUseCase(_repository.Object, _squads.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsTeam_WhenExists()
    {
        Team team = TestDataFactory.CreateTeam(name: "Ecosistema Digital");
        var request = new GetTeamByIdRequest(team.Id);

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);

        GetTeamByIdResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.Equal(team.Id, response.Team.Id);
        Assert.Equal("Ecosistema Digital", response.Team.Name);
        Assert.Equal(0, response.Team.SquadCount);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesSquadCount()
    {
        Team team = TestDataFactory.CreateTeam();
        var squads = new[] { TestDataFactory.CreateSquad(teamId: team.Id) };

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);

        GetTeamByIdResponse response = await CreateUseCase(squads).ExecuteAsync(new GetTeamByIdRequest(team.Id));

        Assert.Equal(1, response.Team.SquadCount);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenTeamDoesNotExist()
    {
        var request = new GetTeamByIdRequest(Guid.NewGuid());

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Team?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));
    }
}
