using Moq;
using GestionCapacidad.Application.UseCases.Squads.DeleteSquad;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DeleteSquadUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteSquadUseCase CreateUseCase() => new(_repository.Object, _unitOfWork.Object);

    [Fact]
    public async Task ExecuteAsync_DeletesSquad_WhenExists()
    {
        Squad squad = TestDataFactory.CreateSquad();
        var request = new DeleteSquadRequest(squad.Id);

        _repository
            .Setup(r => r.GetByIdAsync(squad.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(squad);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        await CreateUseCase().ExecuteAsync(request);

        _repository.Verify(r => r.Delete(It.IsAny<Squad>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        var request = new DeleteSquadRequest(Guid.NewGuid());

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.Delete(It.IsAny<Squad>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
