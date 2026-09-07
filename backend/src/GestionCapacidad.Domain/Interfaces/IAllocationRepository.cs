using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IAllocationRepository : IRepository<Allocation>
{
    Task<IReadOnlyList<Allocation>> GetBySquadAsync(Guid squadId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Allocation>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default);

    /// <summary>Una persona tiene una sola asignación: esto decide si puede recibir otra.</summary>
    Task<bool> ExistsByPersonAsync(Guid personId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<(Allocation Allocation, Person Person)> Items, int TotalCount)> GetBySquadPagedAsync(
        Guid squadId,
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<int>? levels = null,
        CancellationToken cancellationToken = default);
}
