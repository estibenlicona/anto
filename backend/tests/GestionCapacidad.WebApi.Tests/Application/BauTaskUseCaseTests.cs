using Moq;
using GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.DeleteBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.GetBauTasks;
using GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BauTaskUseCaseTests
{
    private readonly Mock<IBauTaskRepository> _bauTaskRepo = new();
    private readonly Mock<ISquadRepository> _squadRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private Squad BuildSquad() => new("Backend", Criticality.High, "Payments", null);

    // ── CreateBauTask ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_CreatesBauTask_WhenSquadExistsAndNameIsUnique()
    {
        Squad squad = BuildSquad();
        var request = new CreateBauTaskRequest(squad.Id, "Production Support");

        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _bauTaskRepo.Setup(r => r.ExistsByNameInSquadAsync(squad.Id, request.Name, default)).ReturnsAsync(false);
        _bauTaskRepo.Setup(r => r.AddAsync(It.IsAny<BauTask>(), default)).Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        CreateBauTaskResponse response = await new CreateBauTaskUseCase(
            _bauTaskRepo.Object, _squadRepo.Object, _unitOfWork.Object, new CreateBauTaskValidator())
            .ExecuteAsync(request);

        Assert.Equal("Production Support", response.BauTask.Name);
        Assert.Equal(squad.Id, response.BauTask.SquadId);
    }

    [Fact]
    public async Task Create_ThrowsNotFound_WhenSquadDoesNotExist()
    {
        var request = new CreateBauTaskRequest(Guid.NewGuid(), "Production Support");
        _squadRepo.Setup(r => r.GetByIdAsync(request.SquadId, default)).ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new CreateBauTaskUseCase(_bauTaskRepo.Object, _squadRepo.Object, _unitOfWork.Object, new CreateBauTaskValidator())
            .ExecuteAsync(request));
    }

    [Fact]
    public async Task Create_ThrowsBadRequest_WhenNameAlreadyExistsInSquad()
    {
        Squad squad = BuildSquad();
        var request = new CreateBauTaskRequest(squad.Id, "Production Support");

        _squadRepo.Setup(r => r.GetByIdAsync(squad.Id, default)).ReturnsAsync(squad);
        _bauTaskRepo.Setup(r => r.ExistsByNameInSquadAsync(squad.Id, request.Name, default)).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            new CreateBauTaskUseCase(_bauTaskRepo.Object, _squadRepo.Object, _unitOfWork.Object, new CreateBauTaskValidator())
            .ExecuteAsync(request));
    }

    // ── GetBauTasks ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_ReturnsTasks_ForSquad()
    {
        var squadId = Guid.NewGuid();
        var tasks = new[] { new BauTask(squadId, "Task A"), new BauTask(squadId, "Task B") };
        _bauTaskRepo.Setup(r => r.GetBySquadAsync(squadId, default)).ReturnsAsync(tasks);

        GetBauTasksResponse response = await new GetBauTasksUseCase(_bauTaskRepo.Object).ExecuteAsync(squadId);

        Assert.Equal(2, response.Tasks.Count);
    }

    // ── UpdateBauTask ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_RenamesTask_WhenExists()
    {
        var squadId = Guid.NewGuid();
        var task = new BauTask(squadId, "Old Name");
        var request = new UpdateBauTaskRequest(squadId, task.Id, "New Name");

        _bauTaskRepo.Setup(r => r.GetByIdAsync(task.Id, default)).ReturnsAsync(task);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        UpdateBauTaskResponse response = await new UpdateBauTaskUseCase(
            _bauTaskRepo.Object, _unitOfWork.Object, new UpdateBauTaskValidator())
            .ExecuteAsync(request);

        Assert.Equal("New Name", response.BauTask.Name);
    }

    [Fact]
    public async Task Update_ThrowsNotFound_WhenTaskDoesNotBelongToSquad()
    {
        var task = new BauTask(Guid.NewGuid(), "Task");
        var request = new UpdateBauTaskRequest(Guid.NewGuid(), task.Id, "New Name"); // different squadId

        _bauTaskRepo.Setup(r => r.GetByIdAsync(task.Id, default)).ReturnsAsync(task);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new UpdateBauTaskUseCase(_bauTaskRepo.Object, _unitOfWork.Object, new UpdateBauTaskValidator())
            .ExecuteAsync(request));
    }

    // ── DeleteBauTask ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_DeletesTask_WhenExists()
    {
        var squadId = Guid.NewGuid();
        var task = new BauTask(squadId, "Production Support");
        var request = new DeleteBauTaskRequest(squadId, task.Id);

        _bauTaskRepo.Setup(r => r.GetByIdAsync(task.Id, default)).ReturnsAsync(task);
        _unitOfWork.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        await new DeleteBauTaskUseCase(_bauTaskRepo.Object, _unitOfWork.Object).ExecuteAsync(request);

        _bauTaskRepo.Verify(r => r.Delete(It.IsAny<BauTask>()), Times.Once);
    }

    [Fact]
    public async Task Delete_ThrowsNotFound_WhenTaskDoesNotExist()
    {
        _bauTaskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default)).ReturnsAsync((BauTask?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeleteBauTaskUseCase(_bauTaskRepo.Object, _unitOfWork.Object)
            .ExecuteAsync(new DeleteBauTaskRequest(Guid.NewGuid(), Guid.NewGuid())));
    }
}
