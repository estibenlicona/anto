namespace GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;

public sealed record UpdateInitiativeRequest(Guid Id, string Name, string Type, int DeadlineMonths);
