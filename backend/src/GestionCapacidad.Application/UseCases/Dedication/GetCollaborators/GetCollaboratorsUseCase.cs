using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Dedication.GetCollaborators;

public sealed record GetCollaboratorsRequest(string? Sprint, int Page, int PageSize, string? Search, IReadOnlyList<Guid>? SquadIds);

public sealed record GetCollaboratorsResponse(CollaboratorDedicationListDto List);

/// <summary>
/// El balance de carga de cada colaborador del chapter en el sprint elegido
/// — el vigente si no se indica. Los cuatro indicadores del resumen hablan
/// del sprint completo, nunca del filtro de búsqueda o de célula.
/// </summary>
public sealed class GetCollaboratorsUseCase(
    IPersonRepository personRepository,
    ISquadRepository squadRepository,
    IAllocationRepository allocationRepository,
    IInitiativeRepository initiativeRepository,
    ISprintRepository sprintRepository,
    ISprintSnapshotRepository snapshotRepository,
    ISingleDocumentRepository<SprintConfiguration> settingsRepository,
    IAbsenceRepository absenceRepository,
    TimeProvider timeProvider) : IUseCase<GetCollaboratorsRequest, GetCollaboratorsResponse>
{
    public async Task<GetCollaboratorsResponse> ExecuteAsync(
        GetCollaboratorsRequest request,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        IReadOnlyList<Person> allPeople = await personRepository.GetAllAsync(cancellationToken);

        DedicationContext context = await DedicationContext.BuildAsync(
            allPeople, squadRepository, allocationRepository, initiativeRepository, sprintRepository,
            snapshotRepository, settingsRepository, absenceRepository, today, cancellationToken);

        Domain.Entities.Sprint? chosen = context.ResolveSprint(request.Sprint);
        if (chosen is null)
        {
            throw new BadRequestException(
                string.IsNullOrWhiteSpace(request.Sprint) ? "No hay ningún sprint configurado todavía" : "Sprint inválido");
        }

        List<CollaboratorDedicationRowDto> allRows = [];
        foreach (Person person in allPeople)
        {
            allRows.Add(await context.BuildRowAsync(person, chosen, cancellationToken));
        }

        CollaboratorDedicationSummaryDto summary = BuildSummary(allRows);

        IEnumerable<CollaboratorDedicationRowDto> filtered = allRows;
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim();
            filtered = filtered.Where(r =>
                r.Person.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                r.Person.Position.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        if (request.SquadIds is { Count: > 0 } squadIds)
        {
            filtered = filtered.Where(r => r.Allocation is not null && squadIds.Contains(r.Allocation.SquadId));
        }

        List<CollaboratorDedicationRowDto> ordered = [.. filtered.OrderBy(SignalRank).ThenBy(r => r.Person.Name, StringComparer.Ordinal)];

        int page = request.Page < 1 ? 1 : request.Page;
        int pageSize = request.PageSize < 1 ? 20 : request.PageSize;
        int totalCount = ordered.Count;
        int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        List<CollaboratorDedicationRowDto> items = [.. ordered.Skip((page - 1) * pageSize).Take(pageSize)];

        var list = new CollaboratorDedicationListDto(
            items, page, pageSize, totalCount, totalPages, summary, context.ToListSprintDto(chosen), context.SettingsDto, null);

        return new GetCollaboratorsResponse(list);
    }

    /// <summary>Sobreasignación y subasignación primero, luego habitual, al final no evaluables.</summary>
    private static int SignalRank(CollaboratorDedicationRowDto row) => row.Balance.Signal switch
    {
        "PossibleOverload" => 0,
        "PossibleUnderload" => 1,
        "Usual" => 2,
        _ => 3,
    };

    private static CollaboratorDedicationSummaryDto BuildSummary(IReadOnlyList<CollaboratorDedicationRowDto> rows)
    {
        List<DedicationPersonRefDto> overloadPeople =
        [
            .. rows.Where(r => r.Balance.Signal == "PossibleOverload").Select(r => new DedicationPersonRefDto(r.Person.Id, r.Person.Name)),
        ];
        List<DedicationPersonRefDto> underloadPeople =
        [
            .. rows.Where(r => r.Balance.Signal == "PossibleUnderload").Select(r => new DedicationPersonRefDto(r.Person.Id, r.Person.Name)),
        ];

        return new CollaboratorDedicationSummaryDto(
            Total: rows.Count,
            PossibleOverload: overloadPeople.Count,
            PossibleUnderload: underloadPeople.Count,
            Usual: rows.Count(r => r.Balance.Signal == "Usual"),
            NotEvaluable: rows.Count(r => r.Balance.Signal == "NotEvaluable"),
            NoIdentity: rows.Count(r => r.Balance.NotEvaluableReason == "NoIdentity"),
            NoSprint: rows.Count(r => r.Balance.NotEvaluableReason == "NoSprint"),
            InsufficientHistory: rows.Count(r => r.Balance.NotEvaluableReason == "InsufficientHistory"),
            OverloadPeople: overloadPeople,
            UnderloadPeople: underloadPeople);
    }
}
