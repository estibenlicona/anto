using Moq;
using GestionCapacidad.Application.UseCases.Teams.CreateTeam;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CreateTeamUseCaseTests
{
    private readonly Mock<ITeamRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CreateTeamValidator _validator = new();

    private CreateTeamUseCase CreateUseCase() =>
        new(_repository.Object, _unitOfWork.Object, _validator);

    [Fact]
    public async Task ExecuteAsync_CreatesTeam_WhenNameIsUnique()
    {
        CreateTeamRequest request = new("Ecosistema Digital", "Equipo dueño de canales digitales");

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository
            .Setup(r => r.AddAsync(It.IsAny<Team>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        CreateTeamResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.NotEqual(Guid.Empty, response.Team.Id);
        Assert.Equal(request.Name, response.Team.Name);
        Assert.Equal(request.Description, response.Team.Description);
        Assert.Equal(0, response.Team.SquadCount);

        _repository.Verify(r => r.AddAsync(It.IsAny<Team>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenNameAlreadyExists()
    {
        CreateTeamRequest request = new("Ecosistema Digital", null);

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.AddAsync(It.IsAny<Team>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        CreateTeamRequest request = new(string.Empty, null);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.ExistsByNameAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
