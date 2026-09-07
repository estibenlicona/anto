using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IAssessmentRepository : IRepository<Assessment>
{
    Task<IReadOnlyList<Assessment>> GetByPersonAndCycleAsync(
        Guid personId,
        string cycle,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Si alguna evaluación <b>cerrada</b> calificó esta habilidad con nivel
    /// — la guarda de borrado del Catálogo de habilidades.
    /// </summary>
    Task<bool> ExistsUsingClosedSkillAsync(Guid skillId, CancellationToken cancellationToken = default);
}
