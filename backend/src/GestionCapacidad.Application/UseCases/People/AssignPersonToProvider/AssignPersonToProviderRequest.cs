namespace GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;

public sealed record AssignPersonToProviderRequest(Guid PersonId, Guid ProviderId);
