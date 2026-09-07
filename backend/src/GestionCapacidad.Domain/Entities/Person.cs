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
        PersonRole role,
        Level level,
        Seniority seniority,
        Modality modality,
        Fte availableFte,
        decimal monthlyCost,
        DateOnly startDate,
        Guid? technicalLeadId = null)
    {
        SetName(name);
        SetDocumentId(documentId);
        EntraObjectId = entraObjectId?.Trim() ?? string.Empty;
        SetUserPrincipalName(userPrincipalName);
        SetPosition(position);
        Role      = role;
        SetTechnicalLead(technicalLeadId);
        Level     = level;
        Seniority = seniority;
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

    public PersonRole Role { get; private set; } = PersonRole.Contributor;

    public Guid? TechnicalLeadId { get; private set; }

    public Level Level { get; private set; } = Level.From(1);

    public Seniority Seniority { get; private set; } = Seniority.Junior;

    public Modality Modality { get; private set; } = Modality.Hybrid;

    public Fte AvailableFte { get; private set; } = Fte.FullTime;

    public decimal MonthlyCost { get; private set; }

    public DateOnly StartDate { get; private set; }

    public Guid? ChapterId { get; private set; }

    /// <summary>A qué línea de expertise pertenece, si a alguna — distinto del chapter (alcance de autorización).</summary>
    public Guid? ExpertiseLineId { get; private set; }

    public Guid? ProviderId { get; private set; }

    /// <summary>El identificador del usuario en Azure DevOps, si ya se vinculó.</summary>
    public string? DevOpsUserId { get; private set; }

    /// <summary>Cuándo se vinculó — distinto de <see cref="Entity.UpdatedAtUtc"/>, que se mueve con cualquier otro cambio de la persona.</summary>
    public DateTime? DevOpsIdentityLinkedAtUtc { get; private set; }

    private readonly List<PersonStack> _stacks = [];

    public IReadOnlyCollection<PersonStack> Stacks => _stacks.AsReadOnly();

    // ── Profile ───────────────────────────────────────────────────────────────

    public void UpdateProfile(
        string name,
        string documentId,
        string entraObjectId,
        string userPrincipalName,
        string position,
        PersonRole role)
    {
        SetName(name);
        SetDocumentId(documentId);
        EntraObjectId = entraObjectId?.Trim() ?? string.Empty;
        SetUserPrincipalName(userPrincipalName);
        SetPosition(position);
        Role = role;
        MarkUpdated();
    }

    // ── Technical lead ────────────────────────────────────────────────────────

    /// <summary>
    /// Quién acompaña técnicamente a la persona. Referencia informativa (sin
    /// navegación): que el id exista y tenga el rol lo valida el use case.
    /// </summary>
    public void AssignTechnicalLead(Guid? technicalLeadId)
    {
        SetTechnicalLead(technicalLeadId);
        MarkUpdated();
    }

    // ── Stacks ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Reemplaza los stacks en bloque: sin repetidos y, cuando la lista no
    /// está vacía, exactamente un principal. Se guardan con el principal
    /// primero, como los muestra el listado.
    /// </summary>
    public void ReplaceStacks(IReadOnlyCollection<PersonStack> stacks)
    {
        ArgumentNullException.ThrowIfNull(stacks);

        var names = new HashSet<string>(StringComparer.Ordinal);
        int primaries = 0;
        foreach (PersonStack stack in stacks)
        {
            if (!names.Add(stack.Name))
            {
                throw new DomainException($"El stack '{stack.Name}' está repetido.");
            }

            if (stack.IsPrimary)
            {
                primaries++;
            }
        }

        if (primaries > 1)
        {
            throw new DomainException("Sólo un stack puede ser el principal.");
        }

        if (stacks.Count > 0 && primaries == 0)
        {
            throw new DomainException("Debe haber un stack principal.");
        }

        _stacks.Clear();
        _stacks.AddRange(stacks.OrderByDescending(s => s.IsPrimary));
        MarkUpdated();
    }

    // ── Level ─────────────────────────────────────────────────────────────

    public void ChangeLevel(Level newLevel)
    {
        if (Level == newLevel)
        {
            return;
        }

        var oldLevel = Level;
        Level = newLevel;
        MarkUpdated();
        AddDomainEvent(new PersonLevelChangedEvent(Id, oldLevel, newLevel));
    }

    // ── Seniority ─────────────────────────────────────────────────────────────

    public void ChangeSeniority(Seniority newSeniority)
    {
        if (Seniority == newSeniority)
        {
            return;
        }

        Seniority = newSeniority;
        MarkUpdated();
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

    // ── Expertise line ────────────────────────────────────────────────────────

    public void AssignToExpertiseLine(Guid expertiseLineId)
    {
        if (expertiseLineId == Guid.Empty)
        {
            throw new DomainException("Expertise line ID must not be empty.");
        }

        ExpertiseLineId = expertiseLineId;
        MarkUpdated();
        AddDomainEvent(new PersonAssignedToExpertiseLineEvent(Id, expertiseLineId));
    }

    public void RemoveFromExpertiseLine()
    {
        ExpertiseLineId = null;
        MarkUpdated();
        AddDomainEvent(new PersonRemovedFromExpertiseLineEvent(Id));
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

    // ── DevOps identity ───────────────────────────────────────────────────────

    public void LinkDevOpsIdentity(string devOpsUserId, DateTime? linkedAtUtc = null)
    {
        if (string.IsNullOrWhiteSpace(devOpsUserId))
        {
            throw new DomainException("El identificador de Azure DevOps es obligatorio.");
        }

        DevOpsUserId = devOpsUserId.Trim();
        DevOpsIdentityLinkedAtUtc = linkedAtUtc ?? DateTime.UtcNow;
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

    private void SetTechnicalLead(Guid? technicalLeadId)
    {
        if (technicalLeadId == Guid.Empty)
        {
            throw new DomainException("Technical lead ID must not be empty.");
        }

        if (technicalLeadId == Id)
        {
            throw new DomainException("Una persona no puede ser su propia líder técnica.");
        }

        TechnicalLeadId = technicalLeadId;
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
