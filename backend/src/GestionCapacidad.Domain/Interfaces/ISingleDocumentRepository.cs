using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Interfaces;

/// <summary>
/// Un agregado del que existe a lo sumo una fila: los parámetros del modelo
/// (calendario de sprints, bandas de talla, mix de capacidades, pool de
/// preguntas). No hay id que buscar — hay o no hay — y por eso no expone
/// <c>GetByIdAsync</c> ni <c>Delete</c>: el guardado reemplaza el contenido
/// del agregado, nunca crea un segundo ni borra el que hay.
/// </summary>
public interface ISingleDocumentRepository<T>
    where T : AggregateRoot
{
    /// <summary>La única fila, o <c>null</c> si nadie ha guardado todavía.</summary>
    Task<T?> GetAsync(CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);
}
