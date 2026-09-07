using GestionCapacidad.Application.Abstractions;

namespace GestionCapacidad.Infrastructure.Catalogs;

/// <summary>
/// Los tres chapters del mock, como lista fija. Sólo lectura: cuando exista
/// administración de chapters, migra a su propio agregado y este proveedor
/// desaparece — igual que <see cref="ChapterStackCatalog"/>.
/// </summary>
public sealed class ChapterDirectoryCatalog : IChapterCatalog
{
    public IReadOnlyCollection<ChapterCatalogEntry> Entries { get; } =
    [
        new(Guid.Parse("c4a91111-1111-1111-1111-111111111111"), "Core y Datos", "ea011111-0000-0000-0000-000000000001", "Tomás Giraldo"),
        new(Guid.Parse("c4a92222-2222-2222-2222-222222222222"), "Canales Digitales", "ea011111-0000-0000-0000-000000000002", "Isabella Moreno"),
        new(Guid.Parse("c4a93333-3333-3333-3333-333333333333"), "Datos Avanzados", "ea011111-0000-0000-0000-000000000003", "Paula Ramírez"),
    ];
}
