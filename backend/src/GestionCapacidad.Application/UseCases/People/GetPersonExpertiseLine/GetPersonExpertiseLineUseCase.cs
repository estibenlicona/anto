using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.GetPersonExpertiseLine;

public sealed record GetPersonExpertiseLineRequest(Guid PersonId);

public sealed record PersonExpertiseLineDto(Guid? Id, string? Name);

public sealed record GetPersonExpertiseLineResponse(PersonExpertiseLineDto ExpertiseLine);

/// <summary>La línea de expertise de una persona, si tiene una vinculada — nula cuando no.</summary>
public sealed class GetPersonExpertiseLineUseCase(
    IPersonRepository personRepository,
    IExpertiseLineRepository expertiseLineRepository) : IUseCase<GetPersonExpertiseLineRequest, GetPersonExpertiseLineResponse>
{
    public async Task<GetPersonExpertiseLineResponse> ExecuteAsync(
        GetPersonExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        if (person.ExpertiseLineId is null)
        {
            return new GetPersonExpertiseLineResponse(new PersonExpertiseLineDto(null, null));
        }

        ExpertiseLine? line = await expertiseLineRepository.GetByIdAsync(person.ExpertiseLineId.Value, cancellationToken);
        return new GetPersonExpertiseLineResponse(new PersonExpertiseLineDto(line?.Id, line?.Name));
    }
}
