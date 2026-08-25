using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class CompanyRepository(ApplicationDbContext dbContext) : Repository<Company>(dbContext), ICompanyRepository
{
    public async Task<Company?> GetByIdentificationNumberAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default)
    {
        return await DbContext.Companies.FirstOrDefaultAsync(
            company => company.IdentificationNumber == identificationNumber,
            cancellationToken);
    }

    public async Task<bool> ExistsByIdentificationNumberAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default)
    {
        return await DbContext.Companies.AnyAsync(
            company => company.IdentificationNumber == identificationNumber,
            cancellationToken);
    }
}
