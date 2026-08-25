using Moq;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.DeleteInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class InitiativeUseCaseTests
{
    private readonly Mock<IInitiativeRepository> _initiativeRepo = new();
    private readonly Mock<ISquadRepository> _squadRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private Squad BuildSquad() => new("Backend", Criticality.High, "Payments", null);
    private Initiative BuildInitiative(Guid squadId) => new(squadId, "Kafka Migration", InitiativeType.Transformation, 6);

    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_CreatesInitiative_WhenSquadExists()
    {
        Squad squad = BuildSquad();
        var request = new CreateInitiativeRequest(squad.Id, "Kafka Migration", "Transformation", 6);

        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _initiativeRepo.Setup(r => r.AddAsync(It.IsAny<Initiative>(), default)).Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        CreateInitiativeResponse response = await new CreateInitiativeUseCase(
            _initiativeRepo.Object, _squadRepo.Object, _unitOfWork.Object, new CreateInitiativeValidator())
            .ExecuteAsync(request);

        Assert.Equal("Kafka Migration", response.Initiative.Name);
        Assert.Equal("Evaluation", response.Initiative.Status);
        Assert.Equal(squad.Id, response.Initiative.SquadId);
    }

    [Fact]
    public async Task Create_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        _squadRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new CreateInitiativeUseCase(_initiativeRepo.Object, _squadRepo.Object, _unitOfWork.Object, new CreateInitiativeValidator())
            .ExecuteAsync(new CreateInitiativeRequest(Guid.NewGuid(), "Name", "Transformation", 6)));
    }

    // ── Get ───────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBySquad_ReturnsInitiatives()
    {
        var squadId = Guid.NewGuid();
        _initiativeRepo.Setup(r => r.GetBySquadAsync(squadId, default))
            .ReturnsAsync(new[] { BuildInitiative(squadId) });

        GetInitiativesResponse response = await new GetInitiativesUseCase(_initiativeRepo.Object).ExecuteAsync(squadId);

        Assert.Single(response.Initiatives);
    }

    [Fact]
    public async Task GetById_ReturnsInitiative_WhenExists()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);

        GetInitiativeByIdResponse response = await new GetInitiativeByIdUseCase(_initiativeRepo.Object)
            .ExecuteAsync(new GetInitiativeByIdRequest(initiative.Id));

        Assert.Equal(initiative.Id, response.Initiative.Id);
    }

    [Fact]
    public async Task GetById_ThrowsNotFound_WhenMissing()
    {
        _initiativeRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((Initiative?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new GetInitiativeByIdUseCase(_initiativeRepo.Object)
            .ExecuteAsync(new GetInitiativeByIdRequest(Guid.NewGuid())));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_RenamesInitiative_WhenExists()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        var request = new UpdateInitiativeRequest(initiative.Id, "New Name", "BAU", 3);

        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        UpdateInitiativeResponse response = await new UpdateInitiativeUseCase(
            _initiativeRepo.Object, _unitOfWork.Object, new UpdateInitiativeValidator())
            .ExecuteAsync(request);

        Assert.Equal("New Name", response.Initiative.Name);
        Assert.Equal(3, response.Initiative.DeadlineMonths);
    }

    // ── ChangeStatus ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ChangeStatus_ToActive_Succeeds_WhenNoOtherActive()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        var request = new ChangeInitiativeStatusRequest(initiative.Id, squadId, "Active");

        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);
        _initiativeRepo.Setup(r => r.HasActiveInitiativeAsync(squadId, initiative.Id, default)).ReturnsAsync(false);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        await new ChangeInitiativeStatusUseCase(_initiativeRepo.Object, _unitOfWork.Object).ExecuteAsync(request);

        Assert.Equal(InitiativeStatus.Active, initiative.Status);
    }

    [Fact]
    public async Task ChangeStatus_ToActive_ThrowsBadRequest_WhenAnotherIsAlreadyActive()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        var request = new ChangeInitiativeStatusRequest(initiative.Id, squadId, "Active");

        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);
        _initiativeRepo.Setup(r => r.HasActiveInitiativeAsync(squadId, initiative.Id, default)).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            new ChangeInitiativeStatusUseCase(_initiativeRepo.Object, _unitOfWork.Object).ExecuteAsync(request));
    }

    [Fact]
    public async Task ChangeStatus_ToClosed_DoesNotCheckActiveRule()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        initiative.ChangeStatus(InitiativeStatus.Active);
        var request = new ChangeInitiativeStatusRequest(initiative.Id, squadId, "Closed");

        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        await new ChangeInitiativeStatusUseCase(_initiativeRepo.Object, _unitOfWork.Object).ExecuteAsync(request);

        Assert.Equal(InitiativeStatus.Closed, initiative.Status);
        _initiativeRepo.Verify(r => r.HasActiveInitiativeAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), default), Times.Never);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_DeletesInitiative_WhenExists()
    {
        var squadId = Guid.NewGuid();
        Initiative initiative = BuildInitiative(squadId);
        _initiativeRepo.Setup(r => r.GetByIdAsync(initiative.Id, default)).ReturnsAsync(initiative);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        await new DeleteInitiativeUseCase(_initiativeRepo.Object, _unitOfWork.Object)
            .ExecuteAsync(new DeleteInitiativeRequest(initiative.Id));

        _initiativeRepo.Verify(r => r.Delete(It.IsAny<Initiative>()), Times.Once);
    }
}
