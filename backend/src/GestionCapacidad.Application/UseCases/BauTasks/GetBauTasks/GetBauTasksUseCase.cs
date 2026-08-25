using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.BauTasks.GetBauTasks;

public sealed class GetBauTasksUseCase(IBauTaskRepository bauTaskRepository) : IUseCase<Guid, GetBauTasksResponse>
{
    public async Task<GetBauTasksResponse> ExecuteAsync(
        Guid squadId,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<BauTask> tasks = await bauTaskRepository.GetBySquadAsync(squadId, cancellationToken);

        var dtos = tasks
            .OrderBy(t => t.Name)
            .Select(BauTaskMappings.ToDto)
            .ToList();

        return new GetBauTasksResponse(dtos);
    }
}
