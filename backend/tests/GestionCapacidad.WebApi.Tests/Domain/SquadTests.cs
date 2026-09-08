using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SquadTests
{
    // ── Construction ──────────────────────────────────────────────────────────

    private static readonly Guid PaymentsTeamId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid DataTeamId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, "Core payment processing squad");

        Assert.NotEqual(Guid.Empty, squad.Id);
        Assert.Equal("Backend Platform", squad.Name);
        Assert.Equal(Criticality.Critical, squad.Criticality);
        Assert.Equal(PaymentsTeamId, squad.TeamId);
        Assert.Equal("Core payment processing squad", squad.Description);
        Assert.Null(squad.DevOpsBoardId);
        Assert.NotEqual(default, squad.CreatedAtUtc);
        Assert.Null(squad.UpdatedAtUtc);
    }

    [Fact]
    public void Create_WithNullDescription_Succeeds()
    {
        var squad = new Squad("Backend Platform", Criticality.High, PaymentsTeamId, null);

        Assert.Null(squad.Description);
    }

    [Fact]
    public void Create_TrimsWhitespaceName()
    {
        var squad = new Squad("  Backend Platform  ", Criticality.Critical, PaymentsTeamId, null);

        Assert.Equal("Backend Platform", squad.Name);
    }

    [Fact]
    public void Create_RaisesSquadCreatedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadCreatedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
        Assert.Equal("Backend Platform", domainEvent.Name);
    }

    // ── Name validation ───────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() =>
            new Squad(name, Criticality.Critical, PaymentsTeamId, null));
    }

    [Fact]
    public void Create_WithNameExceedingMaxLength_ThrowsDomainException()
    {
        var longName = new string('A', 201);

        Assert.Throws<DomainException>(() =>
            new Squad(longName, Criticality.Critical, PaymentsTeamId, null));
    }

    // ── TeamId validation ─────────────────────────────────────────────────────

    [Fact]
    public void Create_WithEmptyTeamId_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new Squad("Backend Platform", Criticality.Critical, Guid.Empty, null));
    }

    // ── Description validation ────────────────────────────────────────────────

    [Fact]
    public void Create_WithDescriptionExceedingMaxLength_ThrowsDomainException()
    {
        var longDescription = new string('D', 501);

        Assert.Throws<DomainException>(() =>
            new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, longDescription));
    }

    // ── Rename ────────────────────────────────────────────────────────────────

    [Fact]
    public void Rename_WithValidName_ChangesName()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.Rename("Data Platform");

        Assert.Equal("Data Platform", squad.Name);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void Rename_RaisesSquadRenamedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.Rename("Data Platform");

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadRenamedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
        Assert.Equal("Backend Platform", domainEvent.OldName);
        Assert.Equal("Data Platform", domainEvent.NewName);
    }

    [Fact]
    public void Rename_WithEmptyName_ThrowsDomainException()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);

        Assert.Throws<DomainException>(() => squad.Rename(string.Empty));
    }

    // ── ChangeCriticality ─────────────────────────────────────────────────────

    [Fact]
    public void ChangeCriticality_WithDifferentValue_UpdatesCriticality()
    {
        var squad = new Squad("Backend Platform", Criticality.Low, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeCriticality(Criticality.Critical);

        Assert.Equal(Criticality.Critical, squad.Criticality);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void ChangeCriticality_RaisesSquadCriticalityChangedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Low, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeCriticality(Criticality.Critical);

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadCriticalityChangedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
        Assert.Equal(Criticality.Low, domainEvent.OldCriticality);
        Assert.Equal(Criticality.Critical, domainEvent.NewCriticality);
    }

    [Fact]
    public void ChangeCriticality_WithSameValue_DoesNotRaiseEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeCriticality(Criticality.Critical);

        Assert.Empty(squad.DomainEvents.OfType<SquadCriticalityChangedEvent>());
    }

    // ── ChangeTeam ────────────────────────────────────────────────────────────

    [Fact]
    public void ChangeTeam_WithDifferentValue_UpdatesTeamId()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeTeam(DataTeamId);

        Assert.Equal(DataTeamId, squad.TeamId);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void ChangeTeam_RaisesSquadTeamChangedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeTeam(DataTeamId);

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadTeamChangedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
        Assert.Equal(PaymentsTeamId, domainEvent.OldTeamId);
        Assert.Equal(DataTeamId, domainEvent.NewTeamId);
    }

    [Fact]
    public void ChangeTeam_WithSameValue_DoesNotRaiseEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.ClearDomainEvents();

        squad.ChangeTeam(PaymentsTeamId);

        Assert.Empty(squad.DomainEvents.OfType<SquadTeamChangedEvent>());
    }

    [Fact]
    public void ChangeTeam_WithEmptyGuid_ThrowsDomainException()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);

        Assert.Throws<DomainException>(() => squad.ChangeTeam(Guid.Empty));
    }

    // ── UpdateDescription ─────────────────────────────────────────────────────

    [Fact]
    public void UpdateDescription_WithValidText_ChangesDescription()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, "Old");
        squad.ClearDomainEvents();

        squad.UpdateDescription("New description");

        Assert.Equal("New description", squad.Description);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void UpdateDescription_WithNull_ClearsDescription()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, "Some description");

        squad.UpdateDescription(null);

        Assert.Null(squad.Description);
    }

    [Fact]
    public void UpdateDescription_ExceedingMaxLength_ThrowsDomainException()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        var longDesc = new string('D', 501);

        Assert.Throws<DomainException>(() => squad.UpdateDescription(longDesc));
    }

    // ── DevOps Board linkage ──────────────────────────────────────────────────

    [Fact]
    public void LinkDevOpsBoard_SetsDevOpsBoardId()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        var boardId = Guid.NewGuid();
        squad.ClearDomainEvents();

        squad.LinkDevOpsBoard(boardId);

        Assert.Equal(boardId, squad.DevOpsBoardId);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void LinkDevOpsBoard_RaisesSquadDevOpsBoardLinkedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        var boardId = Guid.NewGuid();
        squad.ClearDomainEvents();

        squad.LinkDevOpsBoard(boardId);

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadDevOpsBoardLinkedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
        Assert.Equal(boardId, domainEvent.BoardId);
    }

    [Fact]
    public void LinkDevOpsBoard_WithEmptyGuid_ThrowsDomainException()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);

        Assert.Throws<DomainException>(() => squad.LinkDevOpsBoard(Guid.Empty));
    }

    [Fact]
    public void UnlinkDevOpsBoard_ClearsDevOpsBoardId()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        squad.LinkDevOpsBoard(Guid.NewGuid());
        squad.ClearDomainEvents();

        squad.UnlinkDevOpsBoard();

        Assert.Null(squad.DevOpsBoardId);
        Assert.NotNull(squad.UpdatedAtUtc);
    }

    [Fact]
    public void UnlinkDevOpsBoard_RaisesSquadDevOpsBoardUnlinkedEvent()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        var boardId = Guid.NewGuid();
        squad.LinkDevOpsBoard(boardId);
        squad.ClearDomainEvents();

        squad.UnlinkDevOpsBoard();

        var domainEvent = Assert.Single(squad.DomainEvents.OfType<SquadDevOpsBoardUnlinkedEvent>());
        Assert.Equal(squad.Id, domainEvent.SquadId);
    }

    // ── Domain Events management ──────────────────────────────────────────────

    [Fact]
    public void ClearDomainEvents_RemovesAllEvents()
    {
        var squad = new Squad("Backend Platform", Criticality.Critical, PaymentsTeamId, null);
        Assert.NotEmpty(squad.DomainEvents);

        squad.ClearDomainEvents();

        Assert.Empty(squad.DomainEvents);
    }
}
