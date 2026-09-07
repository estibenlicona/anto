using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class SkillRepository(ApplicationDbContext dbContext)
    : Repository<Skill>(dbContext), ISkillRepository
{
    public async Task<bool> ExistsByNameAsync(
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        // Comparación insensible a mayúsculas y espacios de borde en memoria:
        // un `ILIKE` u otra función de texto ataría el repositorio a un solo
        // proveedor, y el catálogo es chico como para no poder traerlo entero.
        string trimmed = name.Trim();
        List<(Guid Id, string Name)> names = await DbSet
            .Select(s => new ValueTuple<Guid, string>(s.Id, s.Name))
            .ToListAsync(cancellationToken);

        return names.Any(s =>
            (excludeId is null || s.Id != excludeId) &&
            string.Equals(s.Name, trimmed, StringComparison.OrdinalIgnoreCase));
    }
}
