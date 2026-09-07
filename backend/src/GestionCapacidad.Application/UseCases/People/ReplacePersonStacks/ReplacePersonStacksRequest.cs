using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.People.ReplacePersonStacks;

public sealed record ReplacePersonStacksRequest(
    Guid PersonId,
    IReadOnlyCollection<PersonStackDto> Stacks);
