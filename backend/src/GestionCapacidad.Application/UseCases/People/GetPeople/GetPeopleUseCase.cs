using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.GetPeople;

public sealed class GetPeopleUseCase(
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository)
    : IUseCase<GetPeopleRequest, GetPeopleResponse>
{
    public async Task<GetPeopleResponse> ExecuteAsync(
        GetPeopleRequest request,
        CancellationToken cancellationToken = default)
    {
        (IReadOnlyList<Person> people, int totalCount) = await personRepository.GetPagedAsync(
            request.Page,
            request.PageSize,
            request.Search,
            request.Levels,
            request.Seniorities,
            request.Stacks,
            cancellationToken);

        // Los derivados (nombre del líder, conteos, utilización) se calculan
        // sobre el total: el líder de alguien de la página puede no estar en ella.
        PersonDerivedData derived = PersonDerivedData.Build(
            await personRepository.GetAllAsync(cancellationToken),
            await allocationRepository.GetAllAsync(cancellationToken));

        var dtos = people.Select(p => PersonMappings.ToDto(p, derived)).ToList();

        return new GetPeopleResponse(
            PagedResult<PersonDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
