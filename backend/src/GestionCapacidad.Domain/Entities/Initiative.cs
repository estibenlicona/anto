using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una iniciativa de la célula: qué se va a hacer, quién la pide, en cuántos
/// meses se quiere, y —cuando se dimensiona— su evaluación guardada.
///
/// La regla de "una sola activa por célula" **no** vive acá: necesita ver el
/// resto de las iniciativas de la célula, y el agregado sólo se conoce a sí
/// mismo. La hace cumplir el use case de cambio de estado.
/// </summary>
public sealed class Initiative : AggregateRoot
{
    public const int MinTargetMonths = 1;
    public const int MaxTargetMonths = 36;

    private Initiative()
    {
    }

    public Initiative(string name, Guid squadId, string productOwner, int targetMonths)
    {
        if (squadId == Guid.Empty)
        {
            throw new DomainException("Squad ID must not be empty.");
        }

        SetName(name);
        SetProductOwner(productOwner);
        SetTargetMonths(targetMonths);

        SquadId = squadId;
        Status = InitiativeStatus.Evaluating;

        AddDomainEvent(new InitiativeCreatedEvent(Id, SquadId, Name));
    }

    public string Name { get; private set; } = string.Empty;

    public Guid SquadId { get; private set; }

    /// <summary>Quién responde por la iniciativa del lado del negocio.</summary>
    public string ProductOwner { get; private set; } = string.Empty;

    /// <summary>En cuántos meses se quiere entregar: el divisor del FTE esperado.</summary>
    public int TargetMonths { get; private set; }

    public InitiativeStatus Status { get; private set; } = InitiativeStatus.Evaluating;

    /// <summary>La evaluación guardada, o <c>null</c> si todavía no se ha dimensionado.</summary>
    public InitiativeEvaluation? Evaluation { get; private set; }

    // ── Edición ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Reemplaza los datos editables. Que la célula exista lo valida el use
    /// case, que es quien conoce el maestro; y re-evaluar tras cambiar el
    /// plazo también es suyo, porque necesita el modelo vigente.
    /// </summary>
    public void Update(string name, Guid squadId, string productOwner, int targetMonths)
    {
        if (squadId == Guid.Empty)
        {
            throw new DomainException("Squad ID must not be empty.");
        }

        string oldName = Name;
        SetName(name);
        SetProductOwner(productOwner);
        SetTargetMonths(targetMonths);
        SquadId = squadId;
        MarkUpdated();

        if (!string.Equals(oldName, Name, StringComparison.Ordinal))
        {
            AddDomainEvent(new InitiativeRenamedEvent(Id, oldName, Name));
        }
    }

    // ── Evaluación ────────────────────────────────────────────────────────────

    /// <summary>
    /// Guarda (o reemplaza) el snapshot de la evaluación. El plazo de la
    /// iniciativa queda alineado con el que se evaluó: son el mismo dato.
    /// </summary>
    public void SaveEvaluation(InitiativeEvaluation evaluation)
    {
        ArgumentNullException.ThrowIfNull(evaluation);

        SetTargetMonths(evaluation.TargetMonths);
        Evaluation = evaluation;
        MarkUpdated();
    }

    // ── Estado ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Cambia el estado. Activar exige haber dimensionado primero; cerrar,
    /// estar activa. La regla de "la célula ya tiene otra activa" la aplica el
    /// use case antes de llamar acá.
    /// </summary>
    public void ChangeStatus(InitiativeStatus newStatus)
    {
        ArgumentNullException.ThrowIfNull(newStatus);

        if (Status == newStatus)
        {
            return;
        }

        if (newStatus == InitiativeStatus.Active && Evaluation is null)
        {
            throw new DomainException("Para activar una iniciativa primero hay que evaluarla");
        }

        if (newStatus == InitiativeStatus.Closed && Status != InitiativeStatus.Active)
        {
            throw new DomainException("Sólo se cierra una iniciativa activa");
        }

        InitiativeStatus oldStatus = Status;
        Status = newStatus;
        MarkUpdated();
        AddDomainEvent(new InitiativeStatusChangedEvent(Id, SquadId, oldStatus, newStatus));
    }

    // ── Guardas privadas ──────────────────────────────────────────────────────

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException($"{nameof(Name)} is required.");
        }

        if (name.Trim().Length > 200)
        {
            throw new DomainException($"{nameof(Name)} cannot exceed 200 characters.");
        }

        Name = name.Trim();
    }

    private void SetProductOwner(string productOwner)
    {
        if (string.IsNullOrWhiteSpace(productOwner))
        {
            throw new DomainException($"{nameof(ProductOwner)} is required.");
        }

        if (productOwner.Trim().Length > 100)
        {
            throw new DomainException($"{nameof(ProductOwner)} cannot exceed 100 characters.");
        }

        ProductOwner = productOwner.Trim();
    }

    private void SetTargetMonths(int months)
    {
        if (months < MinTargetMonths || months > MaxTargetMonths)
        {
            throw new DomainException(
                $"El plazo debe estar entre {MinTargetMonths} y {MaxTargetMonths} meses. Recibido: {months}.");
        }

        TargetMonths = months;
    }
}
