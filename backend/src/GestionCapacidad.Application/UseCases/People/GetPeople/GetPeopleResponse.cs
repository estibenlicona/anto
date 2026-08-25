using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.People.GetPeople;

public sealed record GetPeopleResponse(PagedResult<PersonDto> People);
