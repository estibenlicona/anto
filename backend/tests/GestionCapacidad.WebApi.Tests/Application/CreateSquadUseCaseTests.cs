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
    private readonly Mock<ITeamRepository> _teams = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CreateSquadValidator _validator = new();

    private CreateSquadUseCase CreateUseCase(Team? team = null)
    {
        _teams.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(team ?? TestDataFactory.CreateTeam(name: "Ecosistema Digital"));
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Initiative>());
        return new CreateSquadUseCase(_repository.Object, _teams.Object, _allocations.Object, _people.Object, _initiatives.Object, _unitOfWork.Object, _validator);
    }

    [Fact]
    public async Task ExecuteAsync_CreatesSquad_WhenNameIsUnique()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest();
        Team team = TestDataFactory.CreateTeam(name: "Ecosistema Digital");

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository
            .Setup(r => r.AddAsync(It.IsAny<Squad>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        CreateSquadResponse response = await CreateUseCase(team).ExecuteAsync(request);

        Assert.NotEqual(Guid.Empty, response.Squad.Id);
        Assert.Equal(request.Name, response.Squad.Name);
        Assert.Equal(request.Criticality, response.Squad.Criticality, StringComparer.OrdinalIgnoreCase);
        Assert.Equal(request.TeamId, response.Squad.TeamId);
        Assert.Equal(team.Name, response.Squad.TeamName);
        Assert.Equal(request.Description, response.Squad.Description);

        // Recién creada: sin gente ni iniciativa, agregados en cero.
        Assert.Equal(0, response.Squad.MemberCount);
        Assert.Equal(0d, response.Squad.AllocatedFte);
        Assert.Null(response.Squad.ActiveInitiative);

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
    public async Task ExecuteAsync_ThrowsBadRequest_WhenTeamDoesNotExist()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest();
        CreateSquadUseCase useCase = CreateUseCase();

        _repository
            .Setup(r => r.ExistsByNameAsync(request.Name, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _teams
            .Setup(r => r.GetByIdAsync(request.TeamId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Team?)null);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(request));

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
