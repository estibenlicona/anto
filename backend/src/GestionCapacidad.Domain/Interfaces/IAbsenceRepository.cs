using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IAbsenceRepository : IRepository<Absence>
{
    /// <summary>
    /// Las ausencias de una persona. Es por donde se pregunta el solape al
    /// registrar: la regla es "esta persona ya tiene una cruzada", así que la
    /// consulta se acota a ella en vez de traer el chapter entero.
    /// </summary>
    Task<IReadOnlyList<Absence>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default);
}
