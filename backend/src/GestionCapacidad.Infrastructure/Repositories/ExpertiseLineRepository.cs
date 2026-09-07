using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class ExpertiseLineRepository(ApplicationDbContext dbContext)
    : Repository<ExpertiseLine>(dbContext), IExpertiseLineRepository
{
    public async Task<bool> ExistsByNameAsync(
        string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        string trimmed = name.Trim();
        List<(Guid Id, string Name)> activeNames = await DbSet
            .Where(l => l.Status == ExpertiseLineStatus.Active)
            .Select(l => new ValueTuple<Guid, string>(l.Id, l.Name))
            .ToListAsync(cancellationToken);

        return activeNames.Any(l =>
            (excludeId is null || l.Id != excludeId) &&
            string.Equals(l.Name, trimmed, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<bool> ExistsByCodeAsync(
        string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        string trimmedCode = code.Trim();
        List<(Guid Id, string Code)> codes = await DbSet
            .Select(l => new ValueTuple<Guid, string>(l.Id, l.Code))
            .ToListAsync(cancellationToken);

        return codes.Any(l =>
            (excludeId is null || l.Id != excludeId) &&
            string.Equals(l.Code, trimmedCode, StringComparison.OrdinalIgnoreCase));
    }
}
