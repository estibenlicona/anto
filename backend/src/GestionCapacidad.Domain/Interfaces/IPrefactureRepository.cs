using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IPrefactureRepository : IRepository<Prefacture>
{
    Task<Prefacture?> GetByPersonAndPeriodAsync(
        Guid personId,
        string period,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Prefacture>> GetByPeriodAsync(
        string period,
        CancellationToken cancellationToken = default);
}
