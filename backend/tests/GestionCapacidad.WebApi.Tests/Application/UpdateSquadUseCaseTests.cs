using Moq;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class UpdateSquadUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly UpdateSquadValidator _validator = new();

    private UpdateSquadUseCase CreateUseCase()
    {
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());
        return new UpdateSquadUseCase(_repository.Object, _allocations.Object, _people.Object, _initiatives.Object, _unitOfWork.Object, _validator);
    }

    [Fact]
    public async Task ExecuteAsync_UpdatesSquad_WhenExists()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Old Name", criticality: Criticality.Low);
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(
            id: squad.Id,
            name: "New Name",
            criticality: "Critical");

        _repository
            .Setup(r => r.GetByIdAsync(squad.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(squad);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        UpdateSquadResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.Equal("New Name", response.Squad.Name);
        Assert.Equal("Critical", response.Squad.Criticality);
        Assert.NotEqual(default, response.Squad.UpdatedAtUtc);
        _repository.Verify(r => r.Update(It.IsAny<Squad>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest();

        _repository
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(name: string.Empty);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));

        _repository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
