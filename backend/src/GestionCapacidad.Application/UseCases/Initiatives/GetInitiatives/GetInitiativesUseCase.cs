using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;

public sealed record GetInitiativesRequest(
    int Page,
    int PageSize,
    string? Search = null,
    IReadOnlyCollection<string>? Statuses = null,
    IReadOnlyCollection<Guid>? SquadIds = null,
    IReadOnlyCollection<string>? Tallas = null);

public sealed record GetInitiativesResponse(PagedResult<InitiativeDto> Initiatives);

/// <summary>
/// El listado global paginado. Los filtros se aplican en memoria sobre el
/// conjunto —son una decena de iniciativas por chapter— y la talla sale de la
/// evaluación guardada, que no es una columna consultable.
/// </summary>
public sealed class GetInitiativesUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository) : IUseCase<GetInitiativesRequest, GetInitiativesResponse>
{
    public async Task<GetInitiativesResponse> ExecuteAsync(
        GetInitiativesRequest request,
        CancellationToken cancellationToken = default)
    {
        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        IReadOnlyList<Initiative> all = await initiativeRepository.GetAllAsync(cancellationToken);

        List<Initiative> matching = [.. all
            .Where(i => Matches(i, request))
            .OrderByDescending(i => i.CreatedAtUtc)
            .ThenBy(i => i.Name, StringComparer.Ordinal)];

        List<InitiativeDto> page = [.. matching
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(context.ToDto)];

        return new GetInitiativesResponse(
            PagedResult<InitiativeDto>.Create(page, matching.Count, request.Page, request.PageSize));
    }

    private static bool Matches(Initiative initiative, GetInitiativesRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Search) &&
            !initiative.Name.Contains(request.Search.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (request.Statuses is { Count: > 0 } &&
            !request.Statuses.Contains(initiative.Status.Value, StringComparer.OrdinalIgnoreCase))
        {
            return false;
        }

        if (request.SquadIds is { Count: > 0 } && !request.SquadIds.Contains(initiative.SquadId))
        {
            return false;
        }

        // Una iniciativa sin evaluar no tiene talla, así que ningún filtro de
        // talla la incluye.
        if (request.Tallas is { Count: > 0 } &&
            (initiative.Evaluation is null ||
             !request.Tallas.Contains(initiative.Evaluation.Talla, StringComparer.OrdinalIgnoreCase)))
        {
            return false;
        }

        return true;
    }
}
