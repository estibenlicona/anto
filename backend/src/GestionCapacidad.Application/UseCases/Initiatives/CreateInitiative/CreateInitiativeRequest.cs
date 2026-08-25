namespace GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;

public sealed record CreateInitiativeRequest(Guid SquadId, string Name, string Type, int DeadlineMonths);
