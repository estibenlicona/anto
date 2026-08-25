using Moq;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CreateSquadUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CreateSquadValidator _validator = new();

    private CreateSquadUseCase CreateUseCase() =>
        new(_repository.Object, _unitOfWork.Object, _validator);

    [Fact]
    public async Task ExecuteAsync_CreatesSquad_WhenNameIsUnique()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest();

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository
            .Setup(r => r.AddAsync(It.IsAny<Squad>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        CreateSquadResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.NotEqual(Guid.Empty, response.Id);
        Assert.Equal(request.Name, response.Name);
        Assert.Equal(request.Criticality, response.Criticality, StringComparer.OrdinalIgnoreCase);
        Assert.Equal(request.Tribe, response.Tribe);
        Assert.Equal(request.Description, response.Description);

        _repository.Verify(r => r.AddAsync(It.IsAny<Squad>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenNameAlreadyExists()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest();

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.AddAsync(It.IsAny<Squad>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(name: string.Empty);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.ExistsByNameAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
