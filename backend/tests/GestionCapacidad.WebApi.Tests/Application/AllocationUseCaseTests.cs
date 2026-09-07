using Moq;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AllocationUseCaseTests
{
    private readonly Mock<IAllocationRepository> _allocationRepo = new();
    private readonly Mock<IPersonRepository> _personRepo = new();
    private readonly Mock<ISquadRepository> _squadRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private Person BuildPerson(string name = "Alice") =>
        new(name, "123", "entra", "alice@co.com", "Dev", PersonRole.Contributor,
            Level.Avanzado, Seniority.Intermediate, Modality.Hybrid, Fte.FullTime, 5000m, new DateOnly(2023, 1, 1));

    private Squad BuildSquad() => new("Backend", Criticality.High, "Payments", null);

    private Allocation BuildAllocation(Guid personId, Guid squadId) =>
        new(personId, squadId, null,
            Percentage.From(80), Percentage.From(30), Percentage.From(50));

    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_CreatesAllocation_AndDerivesPersonFieldsAndMargin()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var request   = new CreateAllocationRequest(squad.Id, person.Id, 80, 30, 50);

        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _allocationRepo.Setup(r => r.ExistsByPersonAsync(person.Id, default)).ReturnsAsync(false);
        _allocationRepo.Setup(r => r.AddAsync(It.IsAny<Allocation>(), default)).Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var response = await new CreateAllocationUseCase(
            _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
            _unitOfWork.Object, new CreateAllocationValidator()).ExecuteAsync(request);

        Assert.Equal(80, response.Allocation.DedicationPercentage);
        Assert.Equal(30, response.Allocation.BauPercentage);
        Assert.Equal(50, response.Allocation.TransformationPercentage);
        Assert.Null(response.Allocation.InitiativeId);

        // Los campos de persona vienen del maestro; el margen es 100 − dedicación.
        Assert.Equal("Dev", response.Allocation.PersonPosition);
        Assert.Equal("Hybrid", response.Allocation.PersonModality);
        Assert.Equal(3, response.Allocation.PersonLevel);
        Assert.Equal("Avanzado", response.Allocation.PersonLevelLabel);
        Assert.Equal(20, response.Allocation.PersonAvailablePercentage);
    }

    [Fact]
    public async Task Create_ThrowsBadRequest_WhenPersonAlreadyHasAnAllocation()
    {
        // Una persona tiene una sola asignación, aunque sea en otra célula.
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var request   = new CreateAllocationRequest(squad.Id, person.Id, 80, 30, 50);

        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _allocationRepo.Setup(r => r.ExistsByPersonAsync(person.Id, default)).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            new CreateAllocationUseCase(
                _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
                _unitOfWork.Object, new CreateAllocationValidator()).ExecuteAsync(request));

        Assert.Contains("ya está asignada", exception.Message);
        _allocationRepo.Verify(r => r.AddAsync(It.IsAny<Allocation>(), default), Times.Never);
    }

    [Fact]
    public async Task Create_ThrowsValidation_WhenBreakdownDoesNotAddUp()
    {
        // 30 + 40 ≠ 80: la mezcla debe cuadrar con la dedicación (400).
        var request = new CreateAllocationRequest(Guid.NewGuid(), Guid.NewGuid(), 80, 30, 40);

        await Assert.ThrowsAsync<ValidationException>(() =>
            new CreateAllocationUseCase(
                _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
                _unitOfWork.Object, new CreateAllocationValidator()).ExecuteAsync(request));
    }

    [Fact]
    public async Task Create_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _personRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new CreateAllocationUseCase(
                _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
                _unitOfWork.Object, new CreateAllocationValidator())
            .ExecuteAsync(new CreateAllocationRequest(Guid.NewGuid(), Guid.NewGuid(), 80, 30, 50)));
    }

    // ── GetBySquad ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBySquad_ReturnsPageOfAllocations_WithPersonFields()
    {
        var squadId = Guid.NewGuid();
        Squad squad = BuildSquad();
        Person person = BuildPerson();
        Allocation allocation = BuildAllocation(person.Id, squadId);
        var items = new[] { (allocation, person) };

        _allocationRepo
            .Setup(r => r.GetBySquadPagedAsync(squadId, 1, 10, null, null, default))
            .ReturnsAsync((items, items.Length));
        _squadRepo.Setup(r => r.GetByIdAsync(squadId, default)).ReturnsAsync(squad);

        var response = await new GetAllocationsBySquadUseCase(_allocationRepo.Object, _squadRepo.Object)
            .ExecuteAsync(new GetAllocationsBySquadRequest(squadId, 1, 10));

        var dto = Assert.Single(response.Allocations.Items);
        Assert.Equal("Alice", dto.PersonName);
        Assert.Equal(squad.Name, dto.SquadName);
        Assert.Equal("Dev", dto.PersonPosition);
        Assert.Equal(20, dto.PersonAvailablePercentage);
        Assert.Equal(1, response.Allocations.TotalCount);
    }

    [Fact]
    public async Task GetBySquad_PassesSearchAndLevels_ToTheRepository()
    {
        var squadId = Guid.NewGuid();
        Squad squad = BuildSquad();
        Person person = BuildPerson();
        var items = new[] { (BuildAllocation(person.Id, squadId), person) };

        _allocationRepo
            .Setup(r => r.GetBySquadPagedAsync(
                squadId, 1, 10, "ali",
                It.Is<IReadOnlyCollection<int>>(l => l.SequenceEqual(new[] { 3 })),
                default))
            .ReturnsAsync((items, items.Length));
        _squadRepo.Setup(r => r.GetByIdAsync(squadId, default)).ReturnsAsync(squad);

        var response = await new GetAllocationsBySquadUseCase(_allocationRepo.Object, _squadRepo.Object)
            .ExecuteAsync(new GetAllocationsBySquadRequest(squadId, 1, 10, "ali", new[] { 3 }));

        Assert.Single(response.Allocations.Items);
        _allocationRepo.VerifyAll();
    }

    [Fact]
    public async Task GetBySquad_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        _squadRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new GetAllocationsBySquadUseCase(_allocationRepo.Object, _squadRepo.Object)
                .ExecuteAsync(new GetAllocationsBySquadRequest(Guid.NewGuid(), 1, 10)));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_UpdatesAllocation_WhenExists()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        Allocation allocation = BuildAllocation(person.Id, squad.Id);
        var request = new UpdateAllocationRequest(allocation.Id, 100, 60, 40);

        _allocationRepo.Setup(r => r.GetByIdAsync(allocation.Id, default)).ReturnsAsync(allocation);
        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var response = await new UpdateAllocationUseCase(
            _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
            _unitOfWork.Object, new UpdateAllocationValidator()).ExecuteAsync(request);

        Assert.Equal(100, response.Allocation.DedicationPercentage);
        Assert.Equal(0, response.Allocation.PersonAvailablePercentage);
        Assert.Equal("Dev", response.Allocation.PersonPosition);
    }

    [Fact]
    public async Task Update_ThrowsValidation_WhenBreakdownDoesNotAddUp()
    {
        var request = new UpdateAllocationRequest(Guid.NewGuid(), 100, 10, 40);

        await Assert.ThrowsAsync<ValidationException>(() =>
            new UpdateAllocationUseCase(
                _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
                _unitOfWork.Object, new UpdateAllocationValidator()).ExecuteAsync(request));
        _allocationRepo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), default), Times.Never);
    }

    [Fact]
    public async Task Update_KeepsTheExistingInitiative()
    {
        // El request del contrato no trae iniciativa: editar porcentajes no la toca.
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var initiativeId = Guid.NewGuid();
        var allocation = new Allocation(person.Id, squad.Id, initiativeId,
            Percentage.From(80), Percentage.From(30), Percentage.From(50));

        _allocationRepo.Setup(r => r.GetByIdAsync(allocation.Id, default)).ReturnsAsync(allocation);
        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var response = await new UpdateAllocationUseCase(
            _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
            _unitOfWork.Object, new UpdateAllocationValidator())
            .ExecuteAsync(new UpdateAllocationRequest(allocation.Id, 60, 30, 30));

        Assert.Equal(initiativeId, response.Allocation.InitiativeId);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_DeletesAllocation_WhenExists()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        Allocation allocation = BuildAllocation(person.Id, squad.Id);

        _allocationRepo.Setup(r => r.GetByIdAsync(allocation.Id, default)).ReturnsAsync(allocation);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        await new DeleteAllocationUseCase(_allocationRepo.Object, _unitOfWork.Object)
            .ExecuteAsync(new DeleteAllocationRequest(allocation.Id));

        _allocationRepo.Verify(r => r.Delete(It.IsAny<Allocation>()), Times.Once);
    }

    [Fact]
    public async Task Delete_ThrowsNotFound_WhenDoesNotExist()
    {
        _allocationRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Allocation?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeleteAllocationUseCase(_allocationRepo.Object, _unitOfWork.Object)
            .ExecuteAsync(new DeleteAllocationRequest(Guid.NewGuid())));
    }
}
