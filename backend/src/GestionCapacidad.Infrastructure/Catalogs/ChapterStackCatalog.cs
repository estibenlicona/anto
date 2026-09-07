using GestionCapacidad.Application.Abstractions;

namespace GestionCapacidad.Infrastructure.Catalogs;

/// <summary>
/// El catálogo de stacks del chapter como lista fija (espejo de
/// STACK_CATALOG del mock del frontend). Sólo lectura: cuando exista
/// administración de stacks, migra a su propio agregado y este proveedor
/// desaparece.
/// </summary>
public sealed class ChapterStackCatalog : IStackCatalog
{
    public IReadOnlyCollection<string> Names { get; } =
    [
        ".NET",
        "Angular",
        "AS400",
        "Azure",
        "Bus de Integración",
        "Java",
        "Kafka",
        "MuleSoft",
        "Power BI",
        "Python",
        "React",
        "React Native",
        "SQL Server",
    ];
}
