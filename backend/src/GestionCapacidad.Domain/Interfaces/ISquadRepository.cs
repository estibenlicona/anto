using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ISquadRepository : IRepository<Squad>
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);

    Task<bool> ExistsByTeamIdAsync(Guid teamId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Squad> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<string>? criticalities = null,
        IReadOnlyCollection<Guid>? teamIds = null,
        CancellationToken cancellationToken = default);
}
