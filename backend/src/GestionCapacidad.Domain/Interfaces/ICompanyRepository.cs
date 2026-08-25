using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetByIdentificationNumberAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByIdentificationNumberAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default);
}
