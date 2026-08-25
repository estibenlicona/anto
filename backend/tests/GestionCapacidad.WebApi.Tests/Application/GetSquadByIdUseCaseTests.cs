using Moq;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetSquadByIdUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();

    private GetSquadByIdUseCase CreateUseCase() => new(_repository.Object);

    [Fact]
    public async Task ExecuteAsync_ReturnsSquad_WhenExists()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        var request = new GetSquadByIdRequest(squad.Id);

        _repository
            .Setup(r => r.GetByIdAsync(squad.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(squad);

        GetSquadByIdResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.Equal(squad.Id, response.Squad.Id);
        Assert.Equal("Backend Platform", response.Squad.Name);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        var request = new GetSquadByIdRequest(Guid.NewGuid());

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));
    }
}
