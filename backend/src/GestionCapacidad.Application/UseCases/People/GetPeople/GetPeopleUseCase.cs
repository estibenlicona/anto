using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.GetPeople;

public sealed class GetPeopleUseCase(IPersonRepository personRepository)
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
            request.Seniorities,
            cancellationToken);

        var dtos = people.Select(PersonMappings.ToDto).ToList();

        return new GetPeopleResponse(
            PagedResult<PersonDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
