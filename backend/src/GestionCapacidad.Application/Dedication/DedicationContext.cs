using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Dedication;

/// <summary>
/// Lo que hace falta para responder una fila o un detalle de Capacidad y que
/// el snapshot solo no sabe: la asignación de la persona, la iniciativa
/// activa de su célula, el resto de sprints para la referencia histórica y
/// la mediana de la célula. Se construye una vez por request, como
/// <c>AbsenceContext</c> e <c>InitiativeContext</c>.
/// </summary>
public sealed class DedicationContext
{
    private readonly IReadOnlyDictionary<Guid, Allocation> _allocationByPerson;
    private readonly IReadOnlyDictionary<Guid, string> _squadNameById;
    private readonly SquadAggregates _squadAggregates;
    private readonly IReadOnlyList<Sprint> _sprints;
    private readonly IReadOnlyDictionary<Guid, List<SprintSnapshot>> _snapshotsByPerson;
    private readonly SprintConfiguration _settings;
    private readonly CapacityCalculator _capacityCalculator;
    private readonly DateOnly _today;

    private DedicationContext(
        IReadOnlyDictionary<Guid, Allocation> allocationByPerson,
        IReadOnlyDictionary<Guid, string> squadNameById,
        SquadAggregates squadAggregates,
        IReadOnlyList<Sprint> sprints,
        IReadOnlyDictionary<Guid, List<SprintSnapshot>> snapshotsByPerson,
        SprintConfiguration settings,
        CapacityCalculator capacityCalculator,
        DateOnly today)
    {
        _allocationByPerson = allocationByPerson;
        _squadNameById = squadNameById;
        _squadAggregates = squadAggregates;
        _sprints = sprints;
        _snapshotsByPerson = snapshotsByPerson;
        _settings = settings;
        _capacityCalculator = capacityCalculator;
        _today = today;
    }

    public static async Task<DedicationContext> BuildAsync(
        IReadOnlyList<Person> allPeople,
        ISquadRepository squadRepository,
        IAllocationRepository allocationRepository,
        IInitiativeRepository initiativeRepository,
        ISprintRepository sprintRepository,
        ISprintSnapshotRepository snapshotRepository,
        ISingleDocumentRepository<SprintConfiguration> settingsRepository,
        IAbsenceRepository absenceRepository,
        DateOnly today,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Allocation> allAllocations = await allocationRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Squad> allSquads = await squadRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Initiative> allInitiatives = await initiativeRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Sprint> allSprints = await sprintRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<SprintSnapshot> allSnapshots = await snapshotRepository.GetByPersonIdsAsync(
            [.. allPeople.Select(p => p.Id)], cancellationToken);
        SprintConfiguration settings = await settingsRepository.GetAsync(cancellationToken)
            ?? ModelParameterDefaults.SprintConfiguration();

        return new DedicationContext(
            // Una persona tiene a lo sumo una asignación vigente.
            allAllocations.GroupBy(a => a.PersonId).ToDictionary(g => g.Key, g => g.First()),
            allSquads.ToDictionary(s => s.Id, s => s.Name),
            SquadAggregates.Build(allAllocations, allPeople, allInitiatives),
            [.. allSprints.OrderBy(s => s.StartDate)],
            allSnapshots.GroupBy(s => s.PersonId).ToDictionary(g => g.Key, g => g.ToList()),
            settings,
            new CapacityCalculator(absenceRepository),
            today);
    }

    public Sprint? CurrentSprint => _sprints.FirstOrDefault(s => s.IsCurrent(_today));

    public Sprint? ResolveSprint(string? name) =>
        string.IsNullOrWhiteSpace(name)
            ? CurrentSprint
            : _sprints.FirstOrDefault(s => string.Equals(s.Name, name, StringComparison.Ordinal));

    public DedicationSettingsDto SettingsDto =>
        new(_settings.HistoryWindowSprints, _settings.MinHistorySprints, _settings.HoursPerSprint);

    public ListSprintDto ToListSprintDto(Sprint sprint)
    {
        int index = IndexOf(sprint);
        return new ListSprintDto(
            sprint.Name, sprint.StartDate, sprint.EndDate, sprint.IsCurrent(_today),
            index > 0 ? _sprints[index - 1].Name : null,
            index >= 0 && index < _sprints.Count - 1 ? _sprints[index + 1].Name : null);
    }

    private int IndexOf(Sprint sprint)
    {
        for (int i = 0; i < _sprints.Count; i++)
        {
            if (_sprints[i].Id == sprint.Id)
            {
                return i;
            }
        }

        return -1;
    }

    // ── Fila del listado ──────────────────────────────────────────────────────

    public async Task<CollaboratorDedicationRowDto> BuildRowAsync(Person person, Sprint chosenSprint, CancellationToken cancellationToken)
    {
        (SprintSnapshot? snapshot, bool hasIdentity, bool hasSprintOverall, bool executionMissing, bool executionSealed,
            CapacityResult capacity, SprintExecutionResult execution, decimal unplannedRate,
            ReferenceResult reference, decimal? medianCompletion, decimal? medianCarryOver, decimal? medianPointsPerFte) =
            await ComputeAsync(person, chosenSprint, cancellationToken);

        BalanceSignalResult balance = BalanceSignalCalculator.Compute(new BalanceInput(
            hasIdentity, hasSprintOverall, reference.Sufficient,
            execution.CommittedPoints, capacity.AvailableFte,
            reference.OwnMedian, medianPointsPerFte,
            executionSealed, executionMissing,
            execution.CompletionRate, medianCompletion,
            execution.CarryOverRate, medianCarryOver,
            unplannedRate,
            snapshot?.Initiatives.Count, snapshot?.Wip,
            reference.OwnDeviationRate, reference.SquadDeviationRate));

        List<ConcurrentInitiativeDto> initiatives = ToInitiativeDtos(snapshot);
        Allocation? allocation = _allocationByPerson.GetValueOrDefault(person.Id);

        return new CollaboratorDedicationRowDto(
            ToPersonDto(person),
            allocation is null ? null : ToAllocationDto(allocation),
            hasIdentity,
            (hasIdentity && hasSprintOverall)
                ? new SprintRefDto(
                    chosenSprint.Name, chosenSprint.StartDate, chosenSprint.EndDate,
                    (snapshot?.Status ?? SnapshotStatus.Missing).Value, snapshot?.SealedAtUtc)
                : null,
            ToCapacityDto(capacity),
            ToExecutionDto(execution),
            ToReferenceDto(reference),
            new MultitaskingDto(snapshot?.Initiatives.Count ?? 0, initiatives, snapshot?.WorkItems.Count ?? 0, snapshot?.Wip),
            initiatives,
            ToBalanceDto(balance));
    }

    // ── Detalle ───────────────────────────────────────────────────────────────

    public async Task<CollaboratorDedicationDetailDto> BuildDetailAsync(
        Person person, Sprint? chosenSprint, CancellationToken cancellationToken)
    {
        List<SprintSnapshot> personSnapshots = _snapshotsByPerson.GetValueOrDefault(person.Id, []);
        bool hasIdentity = person.DevOpsUserId is not null;

        List<SprintTrendPointDto> trend = [];
        foreach (Sprint sprint in _sprints)
        {
            SprintSnapshot? snapshot = personSnapshots.FirstOrDefault(s => s.SprintId == sprint.Id);
            SprintExecutionResult execution = ToExecutionResult(snapshot);
            trend.Add(new SprintTrendPointDto(
                sprint.Name, sprint.StartDate, sprint.EndDate,
                (snapshot?.Status ?? SnapshotStatus.Missing).Value, snapshot?.SealedAtUtc, sprint.IsCurrent(_today),
                ToExecutionDto(execution),
                new SprintActivityTotalsDto(
                    snapshot?.Activity.Sum(a => a.Commits) ?? 0,
                    snapshot?.Activity.Sum(a => a.Releases) ?? 0,
                    snapshot?.Activity.Sum(a => a.Features) ?? 0)));
        }

        SelectedSprintDto? selected = null;
        if (chosenSprint is not null)
        {
            (SprintSnapshot? snapshot, bool _, bool hasSprintOverall, bool executionMissing, bool executionSealed,
                CapacityResult capacity, SprintExecutionResult execution, decimal unplannedRate,
                ReferenceResult reference, decimal? medianCompletion, decimal? medianCarryOver, decimal? medianPointsPerFte) =
                await ComputeAsync(person, chosenSprint, cancellationToken);

            BalanceSignalResult balance = BalanceSignalCalculator.Compute(new BalanceInput(
                hasIdentity, hasSprintOverall, reference.Sufficient,
                execution.CommittedPoints, capacity.AvailableFte,
                reference.OwnMedian, medianPointsPerFte,
                executionSealed, executionMissing,
                execution.CompletionRate, medianCompletion,
                execution.CarryOverRate, medianCarryOver,
                unplannedRate,
                snapshot?.Initiatives.Count, snapshot?.Wip,
                reference.OwnDeviationRate, reference.SquadDeviationRate));

            List<ConcurrentInitiativeDto> initiatives = ToInitiativeDtos(snapshot);

            selected = new SelectedSprintDto(
                chosenSprint.Name, chosenSprint.StartDate, chosenSprint.EndDate,
                (snapshot?.Status ?? SnapshotStatus.Missing).Value, snapshot?.SealedAtUtc,
                ToCapacityDto(capacity),
                ToExecutionDto(execution),
                new UnplannedWorkDto(
                    snapshot?.CommittedAtStartPoints ?? 0m, snapshot?.AddedDuringSprintPoints ?? 0m,
                    execution.CommittedPoints, unplannedRate),
                new MultitaskingDto(snapshot?.Initiatives.Count ?? 0, initiatives, snapshot?.WorkItems.Count ?? 0, snapshot?.Wip),
                ToReferenceDto(reference),
                ToBalanceDto(balance),
                [.. (snapshot?.WorkItems ?? []).Select(ToWorkItemDto)],
                [.. (snapshot?.Activity ?? []).Select(a => new ActivityDayDto(a.Date, a.Commits, a.Releases, a.Features))]);
        }

        Allocation? allocation = _allocationByPerson.GetValueOrDefault(person.Id);

        return new CollaboratorDedicationDetailDto(
            ToPersonDto(person),
            allocation is null ? null : ToAllocationDto(allocation),
            hasIdentity,
            SettingsDto,
            null,
            trend,
            selected);
    }

    // ── Cálculo compartido ────────────────────────────────────────────────────

    private async Task<(
        SprintSnapshot? Snapshot, bool HasIdentity, bool HasSprintOverall, bool ExecutionMissing, bool ExecutionSealed,
        CapacityResult Capacity, SprintExecutionResult Execution, decimal UnplannedRate,
        ReferenceResult Reference, decimal? MedianCompletion, decimal? MedianCarryOver, decimal? MedianPointsPerFte)>
        ComputeAsync(Person person, Sprint chosenSprint, CancellationToken cancellationToken)
    {
        List<SprintSnapshot> personSnapshots = _snapshotsByPerson.GetValueOrDefault(person.Id, []);
        SprintSnapshot? snapshot = personSnapshots.FirstOrDefault(s => s.SprintId == chosenSprint.Id);

        bool hasIdentity = person.DevOpsUserId is not null;
        bool hasSprintOverall = personSnapshots.Count > 0;
        bool executionMissing = snapshot is null || snapshot.Status == SnapshotStatus.Missing;
        bool executionSealed = snapshot is not null && snapshot.Status == SnapshotStatus.Sealed;

        CapacityResult capacity = await _capacityCalculator.ComputeAsync(
            person.Id, person.AvailableFte, chosenSprint.StartDate, chosenSprint.EndDate, chosenSprint.Holidays,
            snapshot?.OtherUnavailableDays ?? 0m, _settings.HoursPerSprint, cancellationToken);

        SprintExecutionResult execution = ToExecutionResult(snapshot);
        decimal committedAtStart = snapshot?.CommittedAtStartPoints ?? 0m;
        decimal addedDuring = snapshot?.AddedDuringSprintPoints ?? 0m;
        decimal unplannedRate = committedAtStart > 0m
            ? Math.Round(addedDuring / committedAtStart * 100m, 1, MidpointRounding.AwayFromZero)
            : 0m;

        ReferenceResult reference = BuildPersonReference(person, chosenSprint, execution.CommittedPoints);
        (decimal? medianCompletion, decimal? medianCarryOver, decimal? medianPointsPerFte) =
            await BuildSecondaryMediansAsync(person, cancellationToken);

        return (snapshot, hasIdentity, hasSprintOverall, executionMissing, executionSealed,
            capacity, execution, unplannedRate, reference, medianCompletion, medianCarryOver, medianPointsPerFte);
    }

    private ReferenceResult BuildPersonReference(Person person, Sprint chosenSprint, decimal chosenCommittedPoints)
    {
        List<HistorySprintPoint> ownPoints = [.. HistoryPointsOf(person.Id)];

        List<HistorySprintPoint>? squadPoints = null;
        decimal? squadCurrentPoints = null;
        if (_allocationByPerson.TryGetValue(person.Id, out Allocation? allocation))
        {
            List<Guid> squadMemberIds =
            [
                .. _allocationByPerson.Values.Where(a => a.SquadId == allocation.SquadId).Select(a => a.PersonId),
            ];

            Dictionary<Guid, List<SprintSnapshot>> bySprint = [];
            foreach (Guid memberId in squadMemberIds)
            {
                foreach (SprintSnapshot snap in _snapshotsByPerson.GetValueOrDefault(memberId, []))
                {
                    if (!bySprint.TryGetValue(snap.SprintId, out List<SprintSnapshot>? list))
                    {
                        list = [];
                        bySprint[snap.SprintId] = list;
                    }

                    list.Add(snap);
                }
            }

            squadPoints = [];
            foreach ((Guid sprintId, List<SprintSnapshot> snapshotsThatSprint) in bySprint)
            {
                Sprint? sprint = _sprints.FirstOrDefault(s => s.Id == sprintId);
                if (sprint is null)
                {
                    continue;
                }

                // El sprint de la célula cuenta como sellado sólo si todos los que aportaron lo están.
                bool allSealed = snapshotsThatSprint.All(s => s.Status == SnapshotStatus.Sealed);
                decimal perCollaborator = snapshotsThatSprint.Sum(s => s.CommittedPoints) / snapshotsThatSprint.Count;
                squadPoints.Add(new HistorySprintPoint(
                    perCollaborator, allSealed ? SnapshotStatus.Sealed : SnapshotStatus.Provisional, sprint.IsCurrent(_today)));
            }

            List<decimal> chosenSquadValues =
            [
                .. bySprint.GetValueOrDefault(chosenSprint.Id, []).Select(s => s.CommittedPoints),
            ];
            squadCurrentPoints = chosenSquadValues.Count > 0 ? chosenSquadValues.Sum() / chosenSquadValues.Count : null;
        }

        return HistoryReference.BuildReference(
            ownPoints, chosenCommittedPoints, _settings.HistoryWindowSprints, _settings.MinHistorySprints,
            squadPoints, squadCurrentPoints);
    }

    private IEnumerable<HistorySprintPoint> HistoryPointsOf(Guid personId)
    {
        foreach (SprintSnapshot snapshot in _snapshotsByPerson.GetValueOrDefault(personId, []))
        {
            Sprint? sprint = _sprints.FirstOrDefault(s => s.Id == snapshot.SprintId);
            if (sprint is not null)
            {
                yield return new HistorySprintPoint(snapshot.CommittedPoints, snapshot.Status, sprint.IsCurrent(_today));
            }
        }
    }

    private async Task<(decimal? MedianCompletion, decimal? MedianCarryOver, decimal? MedianPointsPerFte)> BuildSecondaryMediansAsync(
        Person person, CancellationToken cancellationToken)
    {
        List<(Sprint Sprint, SprintSnapshot Snapshot)> sealedHistorical = [];
        foreach (SprintSnapshot snapshot in _snapshotsByPerson.GetValueOrDefault(person.Id, []))
        {
            Sprint? sprint = _sprints.FirstOrDefault(s => s.Id == snapshot.SprintId);
            if (sprint is null || sprint.IsCurrent(_today) || snapshot.Status != SnapshotStatus.Sealed)
            {
                continue;
            }

            sealedHistorical.Add((sprint, snapshot));
        }

        List<(Sprint Sprint, SprintSnapshot Snapshot)> windowed = [.. sealedHistorical.OrderBy(x => x.Sprint.StartDate)];
        if (windowed.Count > _settings.HistoryWindowSprints)
        {
            windowed = [.. windowed.TakeLast(_settings.HistoryWindowSprints)];
        }

        List<decimal> completionRates = [];
        List<decimal> carryOverRates = [];
        List<decimal> pointsPerFte = [];
        foreach ((Sprint sprint, SprintSnapshot snapshot) in windowed)
        {
            if (snapshot.CompletedPoints is decimal completed && snapshot.CommittedPoints > 0m)
            {
                completionRates.Add(Math.Round(completed / snapshot.CommittedPoints * 100m, 1, MidpointRounding.AwayFromZero));
            }

            if (snapshot.CarryOverPoints is decimal carryOver && snapshot.CommittedPoints > 0m)
            {
                carryOverRates.Add(Math.Round(carryOver / snapshot.CommittedPoints * 100m, 1, MidpointRounding.AwayFromZero));
            }

            CapacityResult capacity = await _capacityCalculator.ComputeAsync(
                person.Id, person.AvailableFte, sprint.StartDate, sprint.EndDate, sprint.Holidays,
                snapshot.OtherUnavailableDays, _settings.HoursPerSprint, cancellationToken);

            if (CapacityCalculator.PointsPerAvailableFte(snapshot.CommittedPoints, capacity.AvailableFte) is decimal ratio)
            {
                pointsPerFte.Add(ratio);
            }
        }

        return (HistoryReference.Median(completionRates), HistoryReference.Median(carryOverRates), HistoryReference.Median(pointsPerFte));
    }

    // ── Mapeos ────────────────────────────────────────────────────────────────

    private static SprintExecutionResult ToExecutionResult(SprintSnapshot? snapshot)
    {
        decimal committed = snapshot?.CommittedPoints ?? 0m;
        decimal? completed = snapshot?.CompletedPoints;
        decimal? notCompleted = completed is null ? null : committed - completed;
        decimal? completionRate = completed is null || committed <= 0m
            ? null : Math.Round(completed.Value / committed * 100m, 1, MidpointRounding.AwayFromZero);
        decimal? carryOver = snapshot?.CarryOverPoints;
        decimal? carryOverRate = carryOver is null || committed <= 0m
            ? null : Math.Round(carryOver.Value / committed * 100m, 1, MidpointRounding.AwayFromZero);

        return new SprintExecutionResult(committed, completed, notCompleted, completionRate, carryOver, carryOverRate);
    }

    private static SprintExecutionDto ToExecutionDto(SprintExecutionResult r) =>
        new(r.CommittedPoints, r.CompletedPoints, r.NotCompletedPoints, r.CompletionRate, r.CarryOverPoints, r.CarryOverRate);

    private static DedicationPersonDto ToPersonDto(Person person) =>
        new(person.Id, person.Name, person.Position, person.Level.Label, null, (decimal)person.AvailableFte.Value);

    private DedicationAllocationDto ToAllocationDto(Allocation allocation)
    {
        SquadAggregate aggregate = _squadAggregates.For(allocation.SquadId);
        return new DedicationAllocationDto(
            allocation.Id,
            allocation.SquadId,
            _squadNameById.GetValueOrDefault(allocation.SquadId, string.Empty),
            aggregate.ActiveInitiative is null
                ? null
                : new DedicationActiveInitiativeDto(
                    aggregate.ActiveInitiative.Id, aggregate.ActiveInitiative.Name, aggregate.ActiveInitiative.Talla),
            allocation.DedicationPercentage.Value,
            allocation.BauPercentage.Value,
            allocation.TransformationPercentage.Value);
    }

    private static CapacityDto ToCapacityDto(CapacityResult r) => new(
        r.ContractualFte, r.AvailableFte,
        new CapacityBreakdownDto(
            r.Breakdown.BusinessDays, r.Breakdown.Holidays, r.Breakdown.VacationDays,
            r.Breakdown.AbsenceDays, r.Breakdown.OtherUnavailableDays),
        r.AvailableHours, r.DeductedHours);

    private static ReferenceDto ToReferenceDto(ReferenceResult r) => new(
        r.OwnMedian, r.SquadMedian, r.SealedSprintCount, r.Sufficient,
        r.OwnDeviationPoints, r.OwnDeviationRate, r.SquadDeviationRate);

    private static BalanceSignalDto ToBalanceDto(BalanceSignalResult r) => new(
        r.Signal.Value, r.OverCount, r.UnderCount, r.SquadContext.Value, r.NotEvaluableReason?.Value,
        [.. r.Evidences.Select(e => new BalanceEvidenceDto(e.Id.Value, e.Direction.Value, e.Value, e.Threshold, e.Strong))]);

    private static List<ConcurrentInitiativeDto> ToInitiativeDtos(SprintSnapshot? snapshot) =>
        [.. (snapshot?.Initiatives ?? []).Select(i => new ConcurrentInitiativeDto(i.EpicId, i.EpicTitle, i.InitiativeId, i.InitiativeName, i.Points))];

    private static WorkItemDto ToWorkItemDto(WorkItemSnapshot item) => new(
        item.WorkItemId, item.Number, item.Title, item.Tag?.Value, item.EpicId, item.EpicTitle,
        item.InitiativeId, item.InitiativeName, item.Points, item.State, item.AddedAfterSprintStart, item.Board, item.Url);
}

/// <summary>Resultado intermedio de ejecución, antes de convertirse en el DTO del contrato.</summary>
internal sealed record SprintExecutionResult(
    decimal CommittedPoints,
    decimal? CompletedPoints,
    decimal? NotCompletedPoints,
    decimal? CompletionRate,
    decimal? CarryOverPoints,
    decimal? CarryOverRate);
