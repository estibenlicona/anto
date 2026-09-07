using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PersonTests
{
    // ── Construction ──────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var person = new Person(
            name: "Carlos López",
            documentId: "123456789",
            entraObjectId: "entra-obj-1",
            userPrincipalName: "carlos.lopez@company.com",
            position: "Backend Developer",
            role: PersonRole.Contributor,
            level: Level.Experto,
            seniority: Seniority.Senior,
            modality: Modality.Hybrid,
            availableFte: Fte.FullTime,
            monthlyCost: 5000m,
            startDate: new DateOnly(2023, 1, 15));

        Assert.NotEqual(Guid.Empty, person.Id);
        Assert.Equal("Carlos López", person.Name);
        Assert.Equal(Level.Experto, person.Level);
        Assert.Equal(Modality.Hybrid, person.Modality);
        Assert.Equal(Fte.FullTime, person.AvailableFte);
        Assert.Equal(5000m, person.MonthlyCost);
        Assert.Null(person.ChapterId);
        Assert.Null(person.ProviderId);
    }

    [Fact]
    public void Create_RaisesPersonCreatedEvent()
    {
        var person = BuildValidPerson();

        var domainEvent = Assert.Single(person.DomainEvents.OfType<PersonCreatedEvent>());
        Assert.Equal(person.Id, domainEvent.PersonId);
        Assert.Equal(person.Name, domainEvent.Name);
    }

    // ── Name validation ───────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() =>
            BuildValidPerson(name: name));
    }

    [Fact]
    public void Create_WithNameExceedingMaxLength_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            BuildValidPerson(name: new string('A', 201)));
    }

    // ── UpdateProfile ─────────────────────────────────────────────────────────

    [Fact]
    public void UpdateProfile_WithValidData_ChangesFields()
    {
        var person = BuildValidPerson();
        person.ClearDomainEvents();

        person.UpdateProfile("María García", "123", "entra-2", "maria@co.com", "Tech Lead", PersonRole.TechnicalLead);

        Assert.Equal("María García", person.Name);
        Assert.Equal("Tech Lead", person.Position);
        Assert.NotNull(person.UpdatedAtUtc);
    }

    [Fact]
    public void UpdateProfile_WithEmptyName_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() =>
            person.UpdateProfile(string.Empty, "123", "e", "u", "p", PersonRole.Contributor));
    }

    // ── ChangeSeniority ───────────────────────────────────────────────────

    [Fact]
    public void ChangeSeniority_WithDifferentValue_UpdatesTheField()
    {
        var person = BuildValidPerson();
        person.ClearDomainEvents();

        person.ChangeSeniority(Seniority.Intermediate);

        Assert.Equal(Seniority.Intermediate, person.Seniority);
    }

    [Fact]
    public void ChangeSeniority_IsIndependentFromLevel()
    {
        // Dos escalas separadas: mover el seniority no toca el nivel.
        var person = BuildValidPerson(level: Level.Experto);

        person.ChangeSeniority(Seniority.Junior);

        Assert.Equal(Level.Experto, person.Level);
        Assert.Equal(Seniority.Junior, person.Seniority);
    }

    // ── AssignTechnicalLead ───────────────────────────────────────────────

    [Fact]
    public void AssignTechnicalLead_WithOtherPersonId_SetsTheReference()
    {
        var person = BuildValidPerson();
        var leadId = Guid.NewGuid();

        person.AssignTechnicalLead(leadId);

        Assert.Equal(leadId, person.TechnicalLeadId);
    }

    [Fact]
    public void AssignTechnicalLead_WithNull_ClearsTheReference()
    {
        var person = BuildValidPerson();
        person.AssignTechnicalLead(Guid.NewGuid());

        person.AssignTechnicalLead(null);

        Assert.Null(person.TechnicalLeadId);
    }

    [Fact]
    public void AssignTechnicalLead_WithOwnId_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.AssignTechnicalLead(person.Id));
    }

    [Fact]
    public void AssignTechnicalLead_WithEmptyGuid_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.AssignTechnicalLead(Guid.Empty));
    }

    // ── ReplaceStacks ─────────────────────────────────────────────────────

    [Fact]
    public void ReplaceStacks_StoresThePrimaryFirst()
    {
        var person = BuildValidPerson();

        person.ReplaceStacks(
        [
            new PersonStack("Azure", Level.Competente, isPrimary: false),
            new PersonStack(".NET", Level.Avanzado, isPrimary: true),
        ]);

        Assert.Equal([".NET", "Azure"], person.Stacks.Select(s => s.Name));
        Assert.True(person.Stacks.First().IsPrimary);
    }

    [Fact]
    public void ReplaceStacks_WithEmptyList_ClearsStacks()
    {
        var person = BuildValidPerson();
        person.ReplaceStacks([new PersonStack(".NET", Level.Avanzado, isPrimary: true)]);

        person.ReplaceStacks([]);

        Assert.Empty(person.Stacks);
    }

    [Fact]
    public void ReplaceStacks_WithDuplicatedName_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.ReplaceStacks(
        [
            new PersonStack(".NET", Level.Avanzado, isPrimary: true),
            new PersonStack(".NET", Level.Competente, isPrimary: false),
        ]));
    }

    [Fact]
    public void ReplaceStacks_WithTwoPrimaries_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.ReplaceStacks(
        [
            new PersonStack(".NET", Level.Avanzado, isPrimary: true),
            new PersonStack("Azure", Level.Competente, isPrimary: true),
        ]));
    }

    [Fact]
    public void ReplaceStacks_WithoutPrimary_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.ReplaceStacks(
        [
            new PersonStack(".NET", Level.Avanzado, isPrimary: false),
        ]));
    }

    // ── ChangeLevel ───────────────────────────────────────────────────────

    [Fact]
    public void ChangeLevel_WithDifferentValue_RaisesEvent()
    {
        var person = BuildValidPerson(level: Level.Principiante);
        person.ClearDomainEvents();

        person.ChangeLevel(Level.Experto);

        Assert.Equal(Level.Experto, person.Level);
        var evt = Assert.Single(person.DomainEvents.OfType<PersonLevelChangedEvent>());
        Assert.Equal(Level.Principiante, evt.OldLevel);
        Assert.Equal(Level.Experto, evt.NewLevel);
    }

    [Fact]
    public void ChangeLevel_WithSameValue_DoesNotRaiseEvent()
    {
        var person = BuildValidPerson(level: Level.Experto);
        person.ClearDomainEvents();

        person.ChangeLevel(Level.Experto);

        Assert.Empty(person.DomainEvents.OfType<PersonLevelChangedEvent>());
    }

    // ── ChangeModality ────────────────────────────────────────────────────────

    [Fact]
    public void ChangeModality_WithDifferentValue_RaisesEvent()
    {
        var person = BuildValidPerson(modality: Modality.Remote);
        person.ClearDomainEvents();

        person.ChangeModality(Modality.Hybrid);

        Assert.Equal(Modality.Hybrid, person.Modality);
        var evt = Assert.Single(person.DomainEvents.OfType<PersonModalityChangedEvent>());
        Assert.Equal(Modality.Remote, evt.OldModality);
        Assert.Equal(Modality.Hybrid, evt.NewModality);
    }

    [Fact]
    public void ChangeModality_WithSameValue_DoesNotRaiseEvent()
    {
        var person = BuildValidPerson(modality: Modality.Remote);
        person.ClearDomainEvents();

        person.ChangeModality(Modality.Remote);

        Assert.Empty(person.DomainEvents.OfType<PersonModalityChangedEvent>());
    }

    // ── UpdateAvailability ────────────────────────────────────────────────────

    [Fact]
    public void UpdateAvailability_ChangesAvailableFte()
    {
        var person = BuildValidPerson();

        person.UpdateAvailability(Fte.HalfTime);

        Assert.Equal(Fte.HalfTime, person.AvailableFte);
        Assert.NotNull(person.UpdatedAtUtc);
    }

    // ── UpdateMonthlyCost ─────────────────────────────────────────────────────

    [Fact]
    public void UpdateMonthlyCost_WithPositiveValue_Succeeds()
    {
        var person = BuildValidPerson();

        person.UpdateMonthlyCost(7500m);

        Assert.Equal(7500m, person.MonthlyCost);
    }

    [Fact]
    public void UpdateMonthlyCost_WithNegativeValue_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.UpdateMonthlyCost(-1m));
    }

    // ── Chapter assignment ────────────────────────────────────────────────────

    [Fact]
    public void AssignToChapter_SetsChapterId_AndRaisesEvent()
    {
        var person = BuildValidPerson();
        var chapterId = Guid.NewGuid();
        person.ClearDomainEvents();

        person.AssignToChapter(chapterId);

        Assert.Equal(chapterId, person.ChapterId);
        Assert.Single(person.DomainEvents.OfType<PersonAssignedToChapterEvent>());
    }

    [Fact]
    public void AssignToChapter_WithEmptyGuid_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.AssignToChapter(Guid.Empty));
    }

    [Fact]
    public void RemoveFromChapter_ClearsChapterId_AndRaisesEvent()
    {
        var person = BuildValidPerson();
        person.AssignToChapter(Guid.NewGuid());
        person.ClearDomainEvents();

        person.RemoveFromChapter();

        Assert.Null(person.ChapterId);
        Assert.Single(person.DomainEvents.OfType<PersonRemovedFromChapterEvent>());
    }

    // ── Expertise line assignment ─────────────────────────────────────────────

    [Fact]
    public void AssignToExpertiseLine_SetsExpertiseLineId_AndRaisesEvent()
    {
        var person = BuildValidPerson();
        var lineId = Guid.NewGuid();
        person.ClearDomainEvents();

        person.AssignToExpertiseLine(lineId);

        Assert.Equal(lineId, person.ExpertiseLineId);
        Assert.Single(person.DomainEvents.OfType<PersonAssignedToExpertiseLineEvent>());
    }

    [Fact]
    public void AssignToExpertiseLine_WithEmptyGuid_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.AssignToExpertiseLine(Guid.Empty));
    }

    [Fact]
    public void RemoveFromExpertiseLine_ClearsExpertiseLineId_AndRaisesEvent()
    {
        var person = BuildValidPerson();
        person.AssignToExpertiseLine(Guid.NewGuid());
        person.ClearDomainEvents();

        person.RemoveFromExpertiseLine();

        Assert.Null(person.ExpertiseLineId);
        Assert.Single(person.DomainEvents.OfType<PersonRemovedFromExpertiseLineEvent>());
    }

    [Fact]
    public void ExpertiseLineId_IsIndependentFromChapterId()
    {
        var person = BuildValidPerson();
        var chapterId = Guid.NewGuid();
        var lineId = Guid.NewGuid();

        person.AssignToChapter(chapterId);
        person.AssignToExpertiseLine(lineId);

        Assert.Equal(chapterId, person.ChapterId);
        Assert.Equal(lineId, person.ExpertiseLineId);
    }

    // ── Provider ──────────────────────────────────────────────────────────────

    [Fact]
    public void AssignToProvider_SetsProviderId()
    {
        var person = BuildValidPerson();
        var providerId = Guid.NewGuid();

        person.AssignToProvider(providerId);

        Assert.Equal(providerId, person.ProviderId);
    }

    [Fact]
    public void AssignToProvider_WithEmptyGuid_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.AssignToProvider(Guid.Empty));
    }

    [Fact]
    public void LinkDevOpsIdentity_NacesWithoutIdentity_LinkingFixesIt()
    {
        var person = BuildValidPerson();

        Assert.Null(person.DevOpsUserId);

        person.LinkDevOpsIdentity("carlos.lopez");

        Assert.Equal("carlos.lopez", person.DevOpsUserId);
    }

    [Fact]
    public void LinkDevOpsIdentity_WithEmptyValue_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() => person.LinkDevOpsIdentity(""));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private static Person BuildValidPerson(
        string name = "Carlos López",
        Level? level = null,
        Modality? modality = null) =>
        new(
            name: name,
            documentId: "123456789",
            entraObjectId: "entra-obj-1",
            userPrincipalName: "carlos@co.com",
            position: "Backend Developer",
            role: PersonRole.Contributor,
            level: level ?? Level.Experto,
            seniority: Seniority.Senior,
            modality: modality ?? Modality.Hybrid,
            availableFte: Fte.FullTime,
            monthlyCost: 5000m,
            startDate: new DateOnly(2024, 1, 1));
}
