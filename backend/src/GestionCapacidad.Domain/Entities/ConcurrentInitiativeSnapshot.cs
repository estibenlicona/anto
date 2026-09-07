namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una épica que tocó el sprint de un colaborador, congelada: id y título de
/// la épica, la iniciativa mapeada si la había (nula si no), y los puntos que
/// aporta. No se resuelve contra el catálogo vivo de iniciativas — ver
/// design.md.
/// </summary>
public sealed class ConcurrentInitiativeSnapshot
{
    private ConcurrentInitiativeSnapshot()
    {
    }

    public ConcurrentInitiativeSnapshot(
        string epicId, string epicTitle, string? initiativeId, string? initiativeName, decimal points)
    {
        EpicId = epicId;
        EpicTitle = epicTitle;
        InitiativeId = initiativeId;
        InitiativeName = initiativeName;
        Points = points;
    }

    public string EpicId { get; private set; } = string.Empty;

    public string EpicTitle { get; private set; } = string.Empty;

    public string? InitiativeId { get; private set; }

    public string? InitiativeName { get; private set; }

    public decimal Points { get; private set; }
}
