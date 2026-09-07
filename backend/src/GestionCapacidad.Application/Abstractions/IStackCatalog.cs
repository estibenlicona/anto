namespace GestionCapacidad.Application.Abstractions;

/// <summary>
/// El catálogo de stacks del chapter (sólo lectura por ahora). Vive como
/// lista fija en Infrastructure hasta que exista administración propia de
/// stacks; entonces migra a su propio agregado.
/// </summary>
public interface IStackCatalog
{
    IReadOnlyCollection<string> Names { get; }
}
