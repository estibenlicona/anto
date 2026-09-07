using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.GetPersonById;

public sealed class GetPersonByIdUseCase(
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository) : IUseCase<GetPersonByIdRequest, GetPersonByIdResponse>
{
    public async Task<GetPersonByIdResponse> ExecuteAsync(
        GetPersonByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.Id, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.Id}' was not found.");

        PersonDerivedData derived = PersonDerivedData.Build(
            await personRepository.GetAllAsync(cancellationToken),
            await allocationRepository.GetAllAsync(cancellationToken));

        return new GetPersonByIdResponse(PersonMappings.ToDto(person, derived));
    }
}
