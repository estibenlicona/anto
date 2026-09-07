using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.People.GetTechnicalLeads;

public sealed record GetTechnicalLeadsResponse(IReadOnlyCollection<PersonRefDto> Leads);
