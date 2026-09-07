using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ISkillRepository : IRepository<Skill>
{
    /// <summary>Sin distinguir mayúsculas ni espacios de borde; <paramref name="excludeId"/> excluye la propia habilidad al editar.</summary>
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
