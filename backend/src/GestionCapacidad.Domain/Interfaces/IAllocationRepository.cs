using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IAllocationRepository : IRepository<Allocation>
{
    Task<IReadOnlyList<Allocation>> GetBySquadAsync(Guid squadId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Allocation>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByPersonAndSquadAsync(Guid personId, Guid squadId, CancellationToken cancellationToken = default);

    Task<int> GetTotalDedicationForPersonAsync(Guid personId, Guid excludeAllocationId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<(Allocation Allocation, string PersonName)> Items, int TotalCount)> GetBySquadPagedAsync(
        Guid squadId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
