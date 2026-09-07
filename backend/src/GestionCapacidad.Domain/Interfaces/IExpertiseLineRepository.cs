using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IExpertiseLineRepository : IRepository<ExpertiseLine>
{
    /// <summary>Sin distinguir mayúsculas ni espacios de borde, sólo entre las no archivadas; <paramref name="excludeId"/> excluye la propia línea al editar.</summary>
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>Sin distinguir mayúsculas ni espacios de borde, entre todas — incluidas las archivadas; <paramref name="excludeId"/> excluye la propia línea al editar.</summary>
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
