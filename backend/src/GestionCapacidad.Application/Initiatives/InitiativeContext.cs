using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.Initiatives;

/// <summary>
/// Lo que hace falta para responder una iniciativa y que la iniciativa sola no
/// sabe: el nombre de su célula y si esa célula ya tiene **otra** activa.
///
/// Se construye una vez por request desde el conjunto completo (mismo patrón
/// que <c>SquadAggregates</c>): con un chapter y una decena de iniciativas el
/// fetch-all alcanza; cuando llegue SQL se reescribe como proyección.
/// </summary>
public sealed class InitiativeContext
{
    private readonly IReadOnlyDictionary<Guid, string> _squadNames;
    private readonly IReadOnlyCollection<Initiative> _all;

    private InitiativeContext(IReadOnlyDictionary<Guid, string> squadNames, IReadOnlyCollection<Initiative> all)
    {
        _squadNames = squadNames;
        _all = all;
    }

    public static async Task<InitiativeContext> BuildAsync(
        IInitiativeRepository initiatives,
        ISquadRepository squads,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Squad> allSquads = await squads.GetAllAsync(cancellationToken);
        IReadOnlyList<Initiative> allInitiatives = await initiatives.GetAllAsync(cancellationToken);

        return new InitiativeContext(
            allSquads.ToDictionary(s => s.Id, s => s.Name),
            allInitiatives);
    }

    /// <summary>Una célula borrada deja el nombre vacío en vez de romper la respuesta.</summary>
    public string SquadNameOf(Guid squadId) => _squadNames.GetValueOrDefault(squadId, string.Empty);

    /// <summary>
    /// ¿La célula de esta iniciativa ya tiene otra activa? Excluirse a sí misma
    /// es lo que permite reactivar la que ya está activa sin chocar consigo
    /// misma.
    /// </summary>
    public bool SquadHasOtherActive(Initiative initiative) =>
        _all.Any(other =>
            other.SquadId == initiative.SquadId &&
            other.Id != initiative.Id &&
            other.Status.IsActive);

    public InitiativeDto ToDto(Initiative initiative) =>
        InitiativeMappings.ToDto(initiative, SquadNameOf(initiative.SquadId), SquadHasOtherActive(initiative));
}
