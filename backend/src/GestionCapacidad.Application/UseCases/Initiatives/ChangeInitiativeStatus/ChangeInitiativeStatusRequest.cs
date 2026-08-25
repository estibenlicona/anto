namespace GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;

public sealed record ChangeInitiativeStatusRequest(Guid Id, Guid SquadId, string Status);
