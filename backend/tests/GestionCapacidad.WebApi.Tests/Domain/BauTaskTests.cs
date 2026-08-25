using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class BauTaskTests
{
    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var squadId = Guid.NewGuid();
        var task = new BauTask(squadId, "Production Support");

        Assert.NotEqual(Guid.Empty, task.Id);
        Assert.Equal(squadId, task.SquadId);
        Assert.Equal("Production Support", task.Name);
    }

    [Fact]
    public void Create_RaisesBauTaskCreatedEvent()
    {
        var task = new BauTask(Guid.NewGuid(), "Knowledge Transfer");

        var evt = Assert.Single(task.DomainEvents.OfType<BauTaskCreatedEvent>());
        Assert.Equal(task.Id, evt.BauTaskId);
        Assert.Equal("Knowledge Transfer", evt.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() => new BauTask(Guid.NewGuid(), name));
    }

    [Fact]
    public void Create_WithNameExceedingMaxLength_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() => new BauTask(Guid.NewGuid(), new string('A', 201)));
    }

    [Fact]
    public void Create_WithEmptySquadId_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() => new BauTask(Guid.Empty, "Production Support"));
    }

    [Fact]
    public void Create_TrimsWhitespaceName()
    {
        var task = new BauTask(Guid.NewGuid(), "  Team Meetings  ");
        Assert.Equal("Team Meetings", task.Name);
    }

    [Fact]
    public void Rename_WithValidName_ChangesName()
    {
        var task = new BauTask(Guid.NewGuid(), "Old Name");
        task.ClearDomainEvents();

        task.Rename("New Name");

        Assert.Equal("New Name", task.Name);
        Assert.NotNull(task.UpdatedAtUtc);
    }

    [Fact]
    public void Rename_RaisesBauTaskRenamedEvent()
    {
        var task = new BauTask(Guid.NewGuid(), "Old Name");
        task.ClearDomainEvents();

        task.Rename("New Name");

        var evt = Assert.Single(task.DomainEvents.OfType<BauTaskRenamedEvent>());
        Assert.Equal("Old Name", evt.OldName);
        Assert.Equal("New Name", evt.NewName);
    }

    [Fact]
    public void Rename_WithEmptyName_ThrowsDomainException()
    {
        var task = new BauTask(Guid.NewGuid(), "Production Support");
        Assert.Throws<DomainException>(() => task.Rename(string.Empty));
    }
}
