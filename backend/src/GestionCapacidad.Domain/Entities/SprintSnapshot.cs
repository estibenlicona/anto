using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// La foto de un colaborador en un sprint: todo lo que las pantallas
/// necesitan sin volver a tocar un catálogo vivo. Nace <see cref="ValueObjects.SnapshotStatus.Provisional"/>
/// y sin ejecución; sellar (<see cref="Seal"/>) es responsabilidad de quien
/// sincroniza — acá sólo existe la capacidad de tener snapshots ya sellados.
///
/// <see cref="PersonId"/> y <see cref="SprintId"/> son referencia informativa,
/// sin navegación — mismo patrón que <c>Allocation.SquadId</c>.
/// </summary>
public sealed class SprintSnapshot : AggregateRoot
{
    private readonly List<ConcurrentInitiativeSnapshot> _initiatives = [];
    private readonly List<WorkItemSnapshot> _workItems = [];
    private readonly List<ActivityDaySnapshot> _activity = [];

    private SprintSnapshot()
    {
    }

    public SprintSnapshot(Guid personId, Guid sprintId)
    {
        if (personId == Guid.Empty)
        {
            throw new DomainException("La persona del snapshot es obligatoria");
        }

        if (sprintId == Guid.Empty)
        {
            throw new DomainException("El sprint del snapshot es obligatorio");
        }

        PersonId = personId;
        SprintId = sprintId;
        Status = SnapshotStatus.Provisional;
    }

    public Guid PersonId { get; private set; }

    public Guid SprintId { get; private set; }

    public SnapshotStatus Status { get; private set; } = SnapshotStatus.Provisional;

    public DateTime? SealedAtUtc { get; private set; }

    public decimal CommittedAtStartPoints { get; private set; }

    public decimal AddedDuringSprintPoints { get; private set; }

    /// <summary>Comprometidos totales: al inicio más lo que entró durante el sprint.</summary>
    public decimal CommittedPoints => CommittedAtStartPoints + AddedDuringSprintPoints;

    /// <summary>Sólo tiene sentido sellado; nulo mientras el sprint sigue en curso.</summary>
    public decimal? CompletedPoints { get; private set; }

    /// <summary>Sólo tiene sentido sellado — nada se arrastra a un sprint que todavía no terminó.</summary>
    public decimal? CarryOverPoints { get; private set; }

    /// <summary>Máximo de HUs a la vez en estado activo; nulo si no se pudo reconstruir.</summary>
    public int? Wip { get; private set; }

    /// <summary>Días que la persona no tuvo disponibles por algo que no es festivo, vacación ni ausencia.</summary>
    public decimal OtherUnavailableDays { get; private set; }

    public IReadOnlyList<ConcurrentInitiativeSnapshot> Initiatives => _initiatives.AsReadOnly();

    public IReadOnlyList<WorkItemSnapshot> WorkItems => _workItems.AsReadOnly();

    public IReadOnlyList<ActivityDaySnapshot> Activity => _activity.AsReadOnly();

    public void SetExecution(
        decimal committedAtStartPoints,
        decimal addedDuringSprintPoints,
        decimal? completedPoints,
        decimal? carryOverPoints,
        int? wip,
        decimal otherUnavailableDays)
    {
        EnsureNotSealed();

        CommittedAtStartPoints = committedAtStartPoints;
        AddedDuringSprintPoints = addedDuringSprintPoints;
        CompletedPoints = completedPoints;
        CarryOverPoints = carryOverPoints;
        Wip = wip;
        OtherUnavailableDays = otherUnavailableDays;

        // Llegar ejecución real dice que el sprint dejó de estar "sin snapshot".
        if (Status == SnapshotStatus.Missing)
        {
            Status = SnapshotStatus.Provisional;
        }

        MarkUpdated();
    }

    public void ReplaceInitiatives(IReadOnlyList<ConcurrentInitiativeSnapshot> initiatives)
    {
        EnsureNotSealed();
        ArgumentNullException.ThrowIfNull(initiatives);

        _initiatives.Clear();
        _initiatives.AddRange(initiatives);
        MarkUpdated();
    }

    public void ReplaceWorkItems(IReadOnlyList<WorkItemSnapshot> workItems)
    {
        EnsureNotSealed();
        ArgumentNullException.ThrowIfNull(workItems);

        _workItems.Clear();
        _workItems.AddRange(workItems);
        MarkUpdated();
    }

    public void ReplaceActivity(IReadOnlyList<ActivityDaySnapshot> activity)
    {
        EnsureNotSealed();
        ArgumentNullException.ThrowIfNull(activity);

        _activity.Clear();
        _activity.AddRange(activity);
        MarkUpdated();
    }

    /// <summary>Congela el snapshot: de ahí en adelante no vuelve a moverse.</summary>
    public void Seal(DateTime sealedAtUtc)
    {
        if (Status == SnapshotStatus.Sealed)
        {
            throw new DomainException("El snapshot ya está sellado");
        }

        if (Status == SnapshotStatus.Missing)
        {
            throw new DomainException("Un snapshot sin datos no se puede sellar");
        }

        Status = SnapshotStatus.Sealed;
        SealedAtUtc = sealedAtUtc;
        MarkUpdated();
    }

    /// <summary>El sprint cerró sin que nunca se sellara: las cifras de hoy ya no son confiables.</summary>
    public void MarkMissing()
    {
        if (Status == SnapshotStatus.Sealed)
        {
            throw new DomainException("El snapshot ya está sellado");
        }

        Status = SnapshotStatus.Missing;
        MarkUpdated();
    }

    private void EnsureNotSealed()
    {
        if (Status == SnapshotStatus.Sealed)
        {
            throw new DomainException("El snapshot ya está sellado y no se puede modificar");
        }
    }
}
