using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

/// <summary>
/// Las iniciativas se leen siempre en conjunto: el listado es global y las
/// reglas que las gobiernan —una activa por célula, el resumen del chapter—
/// miran a todas y no a una célula aislada. Por eso no hay consulta por
/// célula: <c>GetAllAsync</c> con un filtro en memoria alcanza para la decena
/// de iniciativas de un chapter, y cuando llegue SQL esto se vuelve proyección.
/// </summary>
public interface IInitiativeRepository : IRepository<Initiative>
{
}
