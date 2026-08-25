using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

public sealed class Person : AggregateRoot
{
    private Person()
    {
    }

    public Person(
        string name,
        string documentId,
        string entraObjectId,
        string userPrincipalName,
        string position,
        string role,
        Seniority seniority,
        Modality modality,
        Fte availableFte,
        decimal monthlyCost,
        DateOnly startDate)
    {
        SetName(name);
        SetDocumentId(documentId);
        EntraObjectId = entraObjectId?.Trim() ?? string.Empty;
        SetUserPrincipalName(userPrincipalName);
        SetPosition(position);
        SetRole(role);
        Seniority     = seniority;
        Modality      = modality;
        AvailableFte  = availableFte;
        SetMonthlyCost(monthlyCost);
        StartDate = startDate;

        AddDomainEvent(new PersonCreatedEvent(Id, Name));
    }

    public string Name { get; private set; } = string.Empty;

    public string DocumentId { get; private set; } = string.Empty;

    public string EntraObjectId { get; private set; } = string.Empty;

    public string UserPrincipalName { get; private set; } = string.Empty;

    public string Position { get; private set; } = string.Empty;

    public string Role { get; private set; } = string.Empty;

    public Seniority Seniority { get; private set; } = Seniority.From(1);

    public Modality Modality { get; private set; } = Modality.Hybrid;

    public Fte AvailableFte { get; private set; } = Fte.FullTime;

    public decimal MonthlyCost { get; private set; }

    public DateOnly StartDate { get; private set; }

    public Guid? ChapterId { get; private set; }

    public Guid? ProviderId { get; private set; }

    // ── Profile ───────────────────────────────────────────────────────────────

    public void UpdateProfile(
        string name,
        string documentId,
        string entraObjectId,
        string userPrincipalName,
        string position,
        string role)
    {
        SetName(name);
        SetDocumentId(documentId);
        EntraObjectId = entraObjectId?.Trim() ?? string.Empty;
        SetUserPrincipalName(userPrincipalName);
        SetPosition(position);
        SetRole(role);
        MarkUpdated();
    }

    // ── Seniority ─────────────────────────────────────────────────────────────

    public void ChangeSeniority(Seniority newSeniority)
    {
        if (Seniority == newSeniority)
        {
            return;
        }

        var oldSeniority = Seniority;
        Seniority = newSeniority;
        MarkUpdated();
        AddDomainEvent(new PersonSeniorityChangedEvent(Id, oldSeniority, newSeniority));
    }

    // ── Modality ──────────────────────────────────────────────────────────────

    public void ChangeModality(Modality newModality)
    {
        if (Modality == newModality)
        {
            return;
        }

        var oldModality = Modality;
        Modality = newModality;
        MarkUpdated();
        AddDomainEvent(new PersonModalityChangedEvent(Id, oldModality, newModality));
    }

    // ── Availability & Cost ───────────────────────────────────────────────────

    public void UpdateAvailability(Fte availableFte)
    {
        AvailableFte = availableFte;
        MarkUpdated();
    }

    public void UpdateMonthlyCost(decimal monthlyCost)
    {
        SetMonthlyCost(monthlyCost);
        MarkUpdated();
    }

    // ── Chapter ───────────────────────────────────────────────────────────────

    public void AssignToChapter(Guid chapterId)
    {
        if (chapterId == Guid.Empty)
        {
            throw new DomainException("Chapter ID must not be empty.");
        }

        ChapterId = chapterId;
        MarkUpdated();
        AddDomainEvent(new PersonAssignedToChapterEvent(Id, chapterId));
    }

    public void RemoveFromChapter()
    {
        ChapterId = null;
        MarkUpdated();
        AddDomainEvent(new PersonRemovedFromChapterEvent(Id));
    }

    // ── Provider ──────────────────────────────────────────────────────────────

    public void AssignToProvider(Guid providerId)
    {
        if (providerId == Guid.Empty)
        {
            throw new DomainException("Provider ID must not be empty.");
        }

        ProviderId = providerId;
        MarkUpdated();
    }

    // ── Private guards ────────────────────────────────────────────────────────

    private void SetName(string name)
    {
        EnsureRequired(name, nameof(Name), 200);
        Name = name.Trim();
    }

    private void SetDocumentId(string documentId)
    {
        EnsureRequired(documentId, nameof(DocumentId), 50);
        DocumentId = documentId.Trim();
    }

    private void SetUserPrincipalName(string upn)
    {
        EnsureRequired(upn, nameof(UserPrincipalName), 250);
        UserPrincipalName = upn.Trim();
    }

    private void SetPosition(string position)
    {
        EnsureRequired(position, nameof(Position), 100);
        Position = position.Trim();
    }

    private void SetRole(string role)
    {
        EnsureRequired(role, nameof(Role), 100);
        Role = role.Trim();
    }

    private void SetMonthlyCost(decimal monthlyCost)
    {
        if (monthlyCost < 0)
        {
            throw new DomainException("Monthly cost must be zero or greater.");
        }

        MonthlyCost = monthlyCost;
    }

    private static void EnsureRequired(string value, string fieldName, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{fieldName} is required.");
        }

        if (value.Length > maxLength)
        {
            throw new DomainException($"{fieldName} cannot exceed {maxLength} characters.");
        }
    }
}
