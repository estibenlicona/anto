using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.GetPersonById;

public sealed class GetPersonByIdUseCase(IPersonRepository personRepository) : IUseCase<GetPersonByIdRequest, GetPersonByIdResponse>
{
    public async Task<GetPersonByIdResponse> ExecuteAsync(
        GetPersonByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.Id, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.Id}' was not found.");

        return new GetPersonByIdResponse(PersonMappings.ToDto(person));
    }
}
