using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class TeamTests
{
    // ── Construction ──────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var team = new Team("Ecosistema Digital", "Equipo dueño de canales digitales");

        Assert.NotEqual(Guid.Empty, team.Id);
        Assert.Equal("Ecosistema Digital", team.Name);
        Assert.Equal("Equipo dueño de canales digitales", team.Description);
        Assert.NotEqual(default, team.CreatedAtUtc);
        Assert.Null(team.UpdatedAtUtc);
    }

    [Fact]
    public void Create_WithNullDescription_Succeeds()
    {
        var team = new Team("Ecosistema Digital", null);

        Assert.Null(team.Description);
    }

    [Fact]
    public void Create_TrimsWhitespaceName()
    {
        var team = new Team("  Ecosistema Digital  ", null);

        Assert.Equal("Ecosistema Digital", team.Name);
    }

    [Fact]
    public void Create_RaisesTeamCreatedEvent()
    {
        var team = new Team("Ecosistema Digital", null);

        var domainEvent = Assert.Single(team.DomainEvents.OfType<TeamCreatedEvent>());
        Assert.Equal(team.Id, domainEvent.TeamId);
        Assert.Equal("Ecosistema Digital", domainEvent.Name);
    }

    // ── Name validation ───────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() => new Team(name, null));
    }

    [Fact]
    public void Create_WithNameExceedingMaxLength_ThrowsDomainException()
    {
        var longName = new string('A', 101);

        Assert.Throws<DomainException>(() => new Team(longName, null));
    }

    // ── Description validation ────────────────────────────────────────────────

    [Fact]
    public void Create_WithDescriptionExceedingMaxLength_ThrowsDomainException()
    {
        var longDescription = new string('D', 501);

        Assert.Throws<DomainException>(() => new Team("Ecosistema Digital", longDescription));
    }

    // ── Rename ────────────────────────────────────────────────────────────────

    [Fact]
    public void Rename_WithValidName_ChangesName()
    {
        var team = new Team("Ecosistema Digital", null);
        team.ClearDomainEvents();

        team.Rename("Riesgo y Fraude");

        Assert.Equal("Riesgo y Fraude", team.Name);
        Assert.NotNull(team.UpdatedAtUtc);
    }

    [Fact]
    public void Rename_RaisesTeamRenamedEvent()
    {
        var team = new Team("Ecosistema Digital", null);
        team.ClearDomainEvents();

        team.Rename("Riesgo y Fraude");

        var domainEvent = Assert.Single(team.DomainEvents.OfType<TeamRenamedEvent>());
        Assert.Equal(team.Id, domainEvent.TeamId);
        Assert.Equal("Ecosistema Digital", domainEvent.OldName);
        Assert.Equal("Riesgo y Fraude", domainEvent.NewName);
    }

    [Fact]
    public void Rename_WithEmptyName_ThrowsDomainException()
    {
        var team = new Team("Ecosistema Digital", null);

        Assert.Throws<DomainException>(() => team.Rename(string.Empty));
    }

    // ── UpdateDescription ─────────────────────────────────────────────────────

    [Fact]
    public void UpdateDescription_WithValidText_ChangesDescription()
    {
        var team = new Team("Ecosistema Digital", "Old");
        team.ClearDomainEvents();

        team.UpdateDescription("New description");

        Assert.Equal("New description", team.Description);
        Assert.NotNull(team.UpdatedAtUtc);
    }

    [Fact]
    public void UpdateDescription_WithNull_ClearsDescription()
    {
        var team = new Team("Ecosistema Digital", "Some description");

        team.UpdateDescription(null);

        Assert.Null(team.Description);
    }

    [Fact]
    public void UpdateDescription_ExceedingMaxLength_ThrowsDomainException()
    {
        var team = new Team("Ecosistema Digital", null);
        var longDesc = new string('D', 501);

        Assert.Throws<DomainException>(() => team.UpdateDescription(longDesc));
    }

    // ── Domain Events management ──────────────────────────────────────────────

    [Fact]
    public void ClearDomainEvents_RemovesAllEvents()
    {
        var team = new Team("Ecosistema Digital", null);
        Assert.NotEmpty(team.DomainEvents);

        team.ClearDomainEvents();

        Assert.Empty(team.DomainEvents);
    }
}
