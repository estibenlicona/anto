using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.PersonDetail;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.PersonDetail.GetPersonDetail;

public sealed record GetPersonDetailRequest(Guid PersonId);

public sealed record GetPersonDetailResponse(PersonDetailDto Detail);

/// <summary>
/// La ficha agregada de una persona: cruza lo que cada módulo ya calcula
/// (Personas, Células, Compañías, Líneas de expertise, Capacidad) sin
/// reinventar ninguna fórmula.
/// </summary>
public sealed class GetPersonDetailUseCase(
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    ISquadRepository squadRepository,
    ITeamRepository teamRepository,
    IAllocationRepository allocationRepository,
    IExpertiseLineRepository expertiseLineRepository,
    IChapterCatalog chapterCatalog,
    IInitiativeRepository initiativeRepository,
    ISprintRepository sprintRepository,
    ISprintSnapshotRepository snapshotRepository,
    ISingleDocumentRepository<SprintConfiguration> settingsRepository,
    IAbsenceRepository absenceRepository,
    TimeProvider timeProvider) : IUseCase<GetPersonDetailRequest, GetPersonDetailResponse>
{
    public async Task<GetPersonDetailResponse> ExecuteAsync(GetPersonDetailRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        IReadOnlyList<Person> allPeople = await personRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Allocation> allAllocations = await allocationRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Squad> allSquads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Person> peopleById = allPeople.ToDictionary(p => p.Id);
        Dictionary<Guid, string> teamNamesById = (await teamRepository.GetAllAsync(cancellationToken))
            .ToDictionary(t => t.Id, t => t.Name);

        PersonDerivedData derived = PersonDerivedData.Build(allPeople, allAllocations);
        PersonDto personDto = PersonMappings.ToDto(person, derived);

        string? providerName = null;
        if (person.ProviderId is Guid providerId)
        {
            Company? company = await companyRepository.GetByIdAsync(providerId, cancellationToken);
            providerName = company?.Name;
        }

        // La única fecha de vigencia de contrato que el mock trae es una tabla
        // fija sobre una sola persona sembrada suya; sin ese mismo dato acá,
        // se responde null en vez de inventar una fecha.
        DateOnly? contractEndsAt = null;

        (string? chapterName, string? chapterLeadName) = ResolveChapterCatalog(person, allPeople);
        (string? lineName, string? lineLeadName) = ResolveExpertiseLine(
            person, await expertiseLineRepository.GetAllAsync(cancellationToken), peopleById);

        PersonDetailAllocationDto? allocationDto = BuildAllocation(person, allAllocations, allSquads, peopleById, teamNamesById);

        DevOpsIdentityDto? devOpsIdentity = null;
        if (person.DevOpsUserId is string devOpsUserId)
        {
            CurrentSprintBalanceDto? currentSprint = await BuildCurrentSprintAsync(person, allPeople, cancellationToken);
            DateOnly linkedAt = DateOnly.FromDateTime(person.DevOpsIdentityLinkedAtUtc ?? person.CreatedAtUtc);
            devOpsIdentity = new DevOpsIdentityDto(devOpsUserId, devOpsUserId, linkedAt, currentSprint);
        }

        List<PersonStackDetailDto> stacks =
        [
            .. person.Stacks.Select(stack =>
            {
                List<Person> others = [.. allPeople.Where(p => p.Id != person.Id && p.Stacks.Any(s => s.Name == stack.Name))];
                return new PersonStackDetailDto(
                    stack.Name, stack.Level.Value, stack.IsPrimary, others.Count,
                    [.. others.Take(3).Select(p => new PersonRefDto(p.Id, p.Name))]);
            }),
        ];

        string costReading = CostReadingCalculator.Compute(person.Level.Value, person.MonthlyCost).Value;

        IReadOnlyList<SuggestedSquadDto> suggestedSquads = allocationDto is null
            ? SuggestedSquadCalculator.Compute(person, allSquads, allAllocations, peopleById)
            : [];

        var detail = new PersonDetailDto(
            personDto, providerName, contractEndsAt, chapterName, chapterLeadName, lineName, lineLeadName,
            allocationDto, devOpsIdentity, stacks, costReading, suggestedSquads);

        return new GetPersonDetailResponse(detail);
    }

    private (string? Name, string? LeadName) ResolveChapterCatalog(Person person, IReadOnlyList<Person> allPeople)
    {
        if (person.ChapterId is not Guid chapterId)
        {
            return (null, null);
        }

        ChapterCatalogEntry? chapter = chapterCatalog.Entries.FirstOrDefault(c => c.Id == chapterId);
        if (chapter is null)
        {
            return (null, null);
        }

        // El lead se resuelve en vivo contra quien tenga ese EntraObjectId — nunca
        // contra una cadena vacía, o cualquier persona sin sesión iniciada calzaría.
        string? liveLeadName = !string.IsNullOrEmpty(chapter.LeadEntraObjectId)
            ? allPeople.FirstOrDefault(p => !string.IsNullOrEmpty(p.EntraObjectId) && p.EntraObjectId == chapter.LeadEntraObjectId)?.Name
            : null;

        return (chapter.Name, liveLeadName ?? chapter.SeededLeadName);
    }

    private static (string? Name, string? LeadName) ResolveExpertiseLine(
        Person person, IReadOnlyList<ExpertiseLine> allLines, IReadOnlyDictionary<Guid, Person> peopleById)
    {
        if (person.ExpertiseLineId is not Guid lineId)
        {
            return (null, null);
        }

        ExpertiseLine? line = allLines.FirstOrDefault(l => l.Id == lineId);
        if (line is null)
        {
            return (null, null);
        }

        string? leadName = line.LeadId is Guid leadId ? peopleById.GetValueOrDefault(leadId)?.Name : null;
        return (line.Name, leadName);
    }

    private static PersonDetailAllocationDto? BuildAllocation(
        Person person,
        IReadOnlyList<Allocation> allAllocations,
        IReadOnlyList<Squad> allSquads,
        IReadOnlyDictionary<Guid, Person> peopleById,
        IReadOnlyDictionary<Guid, string> teamNamesById)
    {
        Allocation? own = allAllocations.FirstOrDefault(a => a.PersonId == person.Id);
        if (own is null)
        {
            return null;
        }

        Squad? squad = allSquads.FirstOrDefault(s => s.Id == own.SquadId);
        List<string> teammates =
        [
            .. allAllocations
                .Where(a => a.SquadId == own.SquadId && a.PersonId != person.Id)
                .Select(a => peopleById.GetValueOrDefault(a.PersonId)?.Name)
                .Where(name => name is not null)
                .Select(name => name!),
        ];

        int requiredLevel = SuggestedSquadCalculator.RequiredLevelFor(squad?.Name, person.Position);

        string teamName = squad is not null ? teamNamesById.GetValueOrDefault(squad.TeamId, string.Empty) : string.Empty;

        return new PersonDetailAllocationDto(
            own.Id, own.SquadId, squad?.Name ?? string.Empty, squad?.Criticality.Value ?? "Low",
            teamName, squad?.Description ?? string.Empty, teammates,
            own.DedicationPercentage.Value, own.BauPercentage.Value, own.TransformationPercentage.Value,
            DateOnly.FromDateTime(own.CreatedAtUtc), requiredLevel);
    }

    private async Task<CurrentSprintBalanceDto?> BuildCurrentSprintAsync(
        Person person, IReadOnlyList<Person> allPeople, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        DedicationContext context = await DedicationContext.BuildAsync(
            allPeople, squadRepository, allocationRepository, initiativeRepository, sprintRepository,
            snapshotRepository, settingsRepository, absenceRepository, today, cancellationToken);

        Sprint? currentSprint = context.CurrentSprint;
        if (currentSprint is null)
        {
            return null;
        }

        CollaboratorDedicationRowDto row = await context.BuildRowAsync(person, currentSprint, cancellationToken);

        return new CurrentSprintBalanceDto(
            row.Sprint ?? new SprintRefDto(currentSprint.Name, currentSprint.StartDate, currentSprint.EndDate, "Missing", null),
            row.Execution.CommittedPoints,
            row.Reference.OwnMedian,
            row.Reference.OwnDeviationRate,
            row.Capacity,
            row.Balance.Signal,
            row.Balance.NotEvaluableReason,
            Math.Max(row.Balance.OverCount, row.Balance.UnderCount));
    }
}
