using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class AbsenceRepository(ApplicationDbContext dbContext)
    : Repository<Absence>(dbContext), IAbsenceRepository
{
    public async Task<IReadOnlyList<Absence>> GetByPersonAsync(
        Guid personId,
        CancellationToken cancellationToken = default) =>
        await DbContext.Absences
            .Where(a => a.PersonId == personId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
}
