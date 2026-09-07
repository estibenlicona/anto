using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.People.ReplacePersonStacks;

public sealed class ReplacePersonStacksUseCase(
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    IStackCatalog stackCatalog,
    IUnitOfWork unitOfWork) : IUseCase<ReplacePersonStacksRequest, ReplacePersonStacksResponse>
{
    public async Task<ReplacePersonStacksResponse> ExecuteAsync(
        ReplacePersonStacksRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Stacks is null)
            throw new BadRequestException("El cuerpo debe traer la lista de stacks.");

        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.PersonId}' was not found.");

        // El catálogo lo conoce esta capa, no el agregado: acá se traduce a
        // 400 antes de tocar el dominio (repetidos y principal los valida
        // ReplaceStacks, pero como DomainException serían 500).
        var stacks = new List<PersonStack>(request.Stacks.Count);
        var names = new HashSet<string>(StringComparer.Ordinal);
        int primaries = 0;
        foreach (PersonStackDto stack in request.Stacks)
        {
            if (!stackCatalog.Names.Contains(stack.Name, StringComparer.Ordinal))
                throw new BadRequestException($"El stack '{stack.Name}' no está en el catálogo del chapter.");

            if (!names.Add(stack.Name))
                throw new BadRequestException($"El stack '{stack.Name}' está repetido.");

            if (stack.Level is < Level.Min or > Level.Max)
                throw new BadRequestException($"El nivel del stack '{stack.Name}' debe estar entre {Level.Min} y {Level.Max}.");

            if (stack.IsPrimary)
                primaries++;

            stacks.Add(new PersonStack(stack.Name, Level.From(stack.Level), stack.IsPrimary));
        }

        if (primaries > 1)
            throw new BadRequestException("Sólo un stack puede ser el principal.");

        if (stacks.Count > 0 && primaries == 0)
            throw new BadRequestException("Debe haber un stack principal.");

        person.ReplaceStacks(stacks);
        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        PersonDerivedData derived = PersonDerivedData.Build(
            await personRepository.GetAllAsync(cancellationToken),
            await allocationRepository.GetAllAsync(cancellationToken));

        return new ReplacePersonStacksResponse(PersonMappings.ToDto(person, derived));
    }
}
