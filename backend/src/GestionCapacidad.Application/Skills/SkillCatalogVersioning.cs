using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.Skills;

/// <summary>
/// Sube la versión del catálogo en la misma transacción que la mutación que
/// la origina — el use case guarda todo junto con un solo
/// <c>SaveChangesAsync</c>.
/// </summary>
public static class SkillCatalogVersioning
{
    public static async Task<int> IncrementAsync(
        ISingleDocumentRepository<SkillCatalogVersion> repository,
        CancellationToken cancellationToken = default)
    {
        SkillCatalogVersion? version = await repository.GetAsync(cancellationToken);
        if (version is null)
        {
            version = new SkillCatalogVersion();
            version.Increment();
            await repository.AddAsync(version, cancellationToken);
            return version.Value;
        }

        version.Increment();
        repository.Update(version);
        return version.Value;
    }

    public static async Task<int> GetCurrentAsync(
        ISingleDocumentRepository<SkillCatalogVersion> repository,
        CancellationToken cancellationToken = default)
    {
        SkillCatalogVersion? version = await repository.GetAsync(cancellationToken);
        return version?.Value ?? 1;
    }
}
