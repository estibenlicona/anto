using Moq;
using GestionCapacidad.Application.UseCases.Teams.UpdateTeam;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class UpdateTeamUseCaseTests
{
    private readonly Mock<ITeamRepository> _repository = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly UpdateTeamValidator _validator = new();

    private UpdateTeamUseCase CreateUseCase()
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
        return new UpdateTeamUseCase(_repository.Object, _squads.Object, _unitOfWork.Object, _validator);
    }

    [Fact]
    public async Task ExecuteAsync_UpdatesTeam_WhenExists()
    {
        Team team = TestDataFactory.CreateTeam(name: "Old Name");
        UpdateTeamRequest request = new(team.Id, "New Name", "Nueva descripción");

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);
        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        UpdateTeamResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.Equal("New Name", response.Team.Name);
        Assert.Equal("Nueva descripción", response.Team.Description);
        Assert.NotNull(team.UpdatedAtUtc);
        _repository.Verify(r => r.Update(It.IsAny<Team>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenTeamDoesNotExist()
    {
        UpdateTeamRequest request = new(Guid.NewGuid(), "New Name", null);

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Team?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenNameAlreadyExistsOnAnotherTeam()
    {
        Team team = TestDataFactory.CreateTeam(name: "Old Name");
        UpdateTeamRequest request = new(team.Id, "Taken Name", null);

        _repository
            .Setup(r => r.GetByIdAsync(team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(team);
        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, team.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => CreateUseCase().ExecuteAsync(request));

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        UpdateTeamRequest request = new(Guid.NewGuid(), string.Empty, null);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
