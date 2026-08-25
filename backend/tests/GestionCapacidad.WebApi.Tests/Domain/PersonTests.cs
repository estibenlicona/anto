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
            role: "Developer",
            seniority: Seniority.Experto,
            modality: Modality.Hybrid,
            availableFte: Fte.FullTime,
            monthlyCost: 5000m,
            startDate: new DateOnly(2023, 1, 15));

        Assert.NotEqual(Guid.Empty, person.Id);
        Assert.Equal("Carlos López", person.Name);
        Assert.Equal(Seniority.Experto, person.Seniority);
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

        person.UpdateProfile("María García", "123", "entra-2", "maria@co.com", "Tech Lead", "Lead");

        Assert.Equal("María García", person.Name);
        Assert.Equal("Tech Lead", person.Position);
        Assert.NotNull(person.UpdatedAtUtc);
    }

    [Fact]
    public void UpdateProfile_WithEmptyName_ThrowsDomainException()
    {
        var person = BuildValidPerson();

        Assert.Throws<DomainException>(() =>
            person.UpdateProfile(string.Empty, "123", "e", "u", "p", "r"));
    }

    // ── ChangeSeniority ───────────────────────────────────────────────────────

    [Fact]
    public void ChangeSeniority_WithDifferentValue_RaisesEvent()
    {
        var person = BuildValidPerson(seniority: Seniority.Principiante);
        person.ClearDomainEvents();

        person.ChangeSeniority(Seniority.Experto);

        Assert.Equal(Seniority.Experto, person.Seniority);
        var evt = Assert.Single(person.DomainEvents.OfType<PersonSeniorityChangedEvent>());
        Assert.Equal(Seniority.Principiante, evt.OldSeniority);
        Assert.Equal(Seniority.Experto, evt.NewSeniority);
    }

    [Fact]
    public void ChangeSeniority_WithSameValue_DoesNotRaiseEvent()
    {
        var person = BuildValidPerson(seniority: Seniority.Experto);
        person.ClearDomainEvents();

        person.ChangeSeniority(Seniority.Experto);

        Assert.Empty(person.DomainEvents.OfType<PersonSeniorityChangedEvent>());
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

    // ── Helper ────────────────────────────────────────────────────────────────

    private static Person BuildValidPerson(
        string name = "Carlos López",
        Seniority? seniority = null,
        Modality? modality = null) =>
        new(
            name: name,
            documentId: "123456789",
            entraObjectId: "entra-obj-1",
            userPrincipalName: "carlos@co.com",
            position: "Backend Developer",
            role: "Developer",
            seniority: seniority ?? Seniority.Experto,
            modality: modality ?? Modality.Hybrid,
            availableFte: Fte.FullTime,
            monthlyCost: 5000m,
            startDate: new DateOnly(2024, 1, 1));
}
