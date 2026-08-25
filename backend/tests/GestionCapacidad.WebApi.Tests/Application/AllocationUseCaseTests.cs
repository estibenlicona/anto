using Moq;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;
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
        new(name, "123", "entra", "alice@co.com", "Dev", "Developer",
            Seniority.Avanzado, Modality.Hybrid, Fte.FullTime, 5000m, new DateOnly(2023, 1, 1));

    private Squad BuildSquad() => new("Backend", Criticality.High, "Payments", null);

    private Allocation BuildAllocation(Guid personId, Guid squadId) =>
        new(personId, squadId, null,
            Percentage.From(80), Percentage.From(30), Percentage.From(50));

    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_CreatesAllocation_WhenPersonAndSquadExist()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var request   = new CreateAllocationRequest(person.Id, squad.Id, null, 80, 30, 50);

        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _allocationRepo.Setup(r => r.ExistsByPersonAndSquadAsync(person.Id, squad.Id, default)).ReturnsAsync(false);
        _allocationRepo.Setup(r => r.GetTotalDedicationForPersonAsync(person.Id, Guid.Empty, default)).ReturnsAsync(0);
        _allocationRepo.Setup(r => r.AddAsync(It.IsAny<Allocation>(), default)).Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var response = await new CreateAllocationUseCase(
            _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
            _unitOfWork.Object, new CreateAllocationValidator()).ExecuteAsync(request);

        Assert.Equal(80, response.Allocation.DedicationPercentage);
        Assert.Equal(30, response.Allocation.BauPercentage);
        Assert.Equal(50, response.Allocation.TransformationPercentage);
    }

    [Fact]
    public async Task Create_ThrowsBadRequest_WhenPersonAlreadyAllocatedToSquad()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var request   = new CreateAllocationRequest(person.Id, squad.Id, null, 80, 30, 50);

        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _allocationRepo.Setup(r => r.ExistsByPersonAndSquadAsync(person.Id, squad.Id, default)).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            new CreateAllocationUseCase(
                _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
                _unitOfWork.Object, new CreateAllocationValidator()).ExecuteAsync(request));
    }

    [Fact]
    public async Task Create_ThrowsBadRequest_WhenTotalDedicationWouldExceed100()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        var request   = new CreateAllocationRequest(person.Id, squad.Id, null, 80, 40, 40);

        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _allocationRepo.Setup(r => r.ExistsByPersonAndSquadAsync(person.Id, squad.Id, default)).ReturnsAsync(false);
        _allocationRepo.Setup(r => r.GetTotalDedicationForPersonAsync(person.Id, Guid.Empty, default)).ReturnsAsync(30);
        // 30 + 80 = 110 > 100 → BadRequest

        await Assert.ThrowsAsync<BadRequestException>(() =>
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
            .ExecuteAsync(new CreateAllocationRequest(Guid.NewGuid(), Guid.NewGuid(), null, 80, 30, 50)));
    }

    // ── GetBySquad ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBySquad_ReturnsPageOfAllocations()
    {
        var squadId = Guid.NewGuid();
        var personId = Guid.NewGuid();
        Squad squad = BuildSquad();
        Allocation allocation = BuildAllocation(personId, squadId);
        var items = new[] { (allocation, "Alice") };

        _allocationRepo
            .Setup(r => r.GetBySquadPagedAsync(squadId, 1, 10, default))
            .ReturnsAsync((items, items.Length));
        _squadRepo.Setup(r => r.GetByIdAsync(squadId, default)).ReturnsAsync(squad);

        var response = await new GetAllocationsBySquadUseCase(_allocationRepo.Object, _squadRepo.Object)
            .ExecuteAsync(new GetAllocationsBySquadRequest(squadId, 1, 10));

        Assert.Single(response.Allocations.Items);
        Assert.Equal("Alice", response.Allocations.Items[0].PersonName);
        Assert.Equal(squad.Name, response.Allocations.Items[0].SquadName);
        Assert.Equal(1, response.Allocations.TotalCount);
    }

    [Fact]
    public async Task GetBySquad_PreservesPersonNameOrder_FromRepository()
    {
        var squadId = Guid.NewGuid();
        Squad squad = BuildSquad();
        var items = new[]
        {
            (BuildAllocation(Guid.NewGuid(), squadId), "Alice"),
            (BuildAllocation(Guid.NewGuid(), squadId), "Bob"),
        };

        _allocationRepo
            .Setup(r => r.GetBySquadPagedAsync(squadId, 1, 10, default))
            .ReturnsAsync((items, items.Length));
        _squadRepo.Setup(r => r.GetByIdAsync(squadId, default)).ReturnsAsync(squad);

        var response = await new GetAllocationsBySquadUseCase(_allocationRepo.Object, _squadRepo.Object)
            .ExecuteAsync(new GetAllocationsBySquadRequest(squadId, 1, 10));

        Assert.Equal(["Alice", "Bob"], response.Allocations.Items.Select(a => a.PersonName));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_UpdatesAllocation_WhenExists()
    {
        Person person = BuildPerson();
        Squad squad   = BuildSquad();
        Allocation allocation = BuildAllocation(person.Id, squad.Id);
        var request = new UpdateAllocationRequest(allocation.Id, null, 100, 60, 40);

        _allocationRepo.Setup(r => r.GetByIdAsync(allocation.Id, default)).ReturnsAsync(allocation);
        _allocationRepo.Setup(r => r.GetTotalDedicationForPersonAsync(person.Id, allocation.Id, default)).ReturnsAsync(0);
        _personRepo.Setup(r => r.GetByIdAsync(person.Id, default)).ReturnsAsync(person);
        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var response = await new UpdateAllocationUseCase(
            _allocationRepo.Object, _personRepo.Object, _squadRepo.Object,
            _unitOfWork.Object, new UpdateAllocationValidator()).ExecuteAsync(request);

        Assert.Equal(100, response.Allocation.DedicationPercentage);
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
