using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ISquadRepository : IRepository<Squad>
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Squad> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
