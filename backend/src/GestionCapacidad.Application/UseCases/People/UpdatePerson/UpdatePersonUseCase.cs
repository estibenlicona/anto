using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.People.UpdatePerson;

public sealed class UpdatePersonUseCase(
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdatePersonRequest> validator) : IUseCase<UpdatePersonRequest, UpdatePersonResponse>
{
    public async Task<UpdatePersonResponse> ExecuteAsync(
        UpdatePersonRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));

        Person? person = await personRepository.GetByIdAsync(request.Id, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.Id}' was not found.");

        if (request.TechnicalLeadId is Guid leadId && leadId != person.Id &&
            await personRepository.GetByIdAsync(leadId, cancellationToken) is null)
            throw new BadRequestException($"Technical lead with id '{leadId}' was not found.");

        PersonRole role = PersonRole.From(request.Role);

        person.UpdateProfile(
            request.Name,
            request.DocumentId,
            request.EntraObjectId,
            request.UserPrincipalName,
            request.Position,
            role);

        person.AssignTechnicalLead(request.TechnicalLeadId);
        person.ChangeLevel(Level.From(request.Level));
        person.ChangeSeniority(Seniority.From(request.Seniority));
        person.ChangeModality(Modality.From(request.Modality));
        person.UpdateAvailability(Fte.From(request.AvailableFte));
        person.UpdateMonthlyCost(request.MonthlyCost);

        personRepository.Update(person);

        // Quien deja de ser líder técnico deja de figurar como el de nadie:
        // el dato no puede quedar apuntando a alguien que ya no lo es.
        if (role != PersonRole.TechnicalLead)
        {
            IReadOnlyList<Person> allPeople = await personRepository.GetAllAsync(cancellationToken);
            foreach (Person follower in allPeople.Where(p => p.TechnicalLeadId == person.Id))
            {
                follower.AssignTechnicalLead(null);
                personRepository.Update(follower);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        PersonDerivedData derived = PersonDerivedData.Build(
            await personRepository.GetAllAsync(cancellationToken),
            await allocationRepository.GetAllAsync(cancellationToken));

        return PersonMappings.ToUpdateResponse(person, derived);
    }
}
