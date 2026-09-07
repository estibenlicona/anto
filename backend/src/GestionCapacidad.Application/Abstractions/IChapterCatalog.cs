namespace GestionCapacidad.Application.Abstractions;

/// <summary>
/// El catálogo de chapters como lista fija (espejo de <c>CHAPTERS</c> del
/// mock del frontend) — sin ruta propia en el contrato para administrarlo.
/// Sólo lectura: cuando exista un maestro editable, migra a su propio
/// agregado y este proveedor desaparece, igual que <see cref="IStackCatalog"/>.
/// </summary>
public interface IChapterCatalog
{
    IReadOnlyCollection<ChapterCatalogEntry> Entries { get; }
}

/// <summary>
/// Un chapter del catálogo: su nombre y, para resolver su lead en vivo, el
/// <c>EntraObjectId</c> de quien lo lidera (con el nombre sembrado como
/// respaldo mientras nadie con ese id haya iniciado sesión todavía).
/// </summary>
public sealed record ChapterCatalogEntry(Guid Id, string Name, string LeadEntraObjectId, string SeededLeadName);
