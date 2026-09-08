using Moq;
using GestionCapacidad.Application.UseCases.Teams.DeleteTeam;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DeleteTeamUseCaseTests
{
    private readonly Mock<ITeamRepository> _repository = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteTeamUseCase CreateUseCase() => new(_repository.Object, _squads.Object, _unitOfWork.Object);

    [Fact]
    public async Task ExecuteAsync_DeletesTeam_WhenItHasNoSquads()
    {
        Team team = TestDataFactory.CreateTeam();
        var request = new DeleteTeamRequest(team.Id);

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);
        _squads
            .Setup(r => r.ExistsByTeamIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        await CreateUseCase().ExecuteAsync(request);

        _repository.Verify(r => r.Delete(It.IsAny<Team>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsConflict_WhenTeamHasSquads()
    {
        Team team = TestDataFactory.CreateTeam();
        var request = new DeleteTeamRequest(team.Id);

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);
        _squads
            .Setup(r => r.ExistsByTeamIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<ConflictException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.Delete(It.IsAny<Team>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenTeamDoesNotExist()
    {
        var request = new DeleteTeamRequest(Guid.NewGuid());

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Team?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.Delete(It.IsAny<Team>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
