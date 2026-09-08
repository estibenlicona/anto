using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ITeamRepository : IRepository<Team>
{
    /// <summary>Sin distinguir mayúsculas ni espacios de borde; <paramref name="excludeId"/> excluye el propio equipo al editar.</summary>
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Team> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default);
}
