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

        person.UpdateProfile(
            request.Name,
            request.DocumentId,
            request.EntraObjectId,
            request.UserPrincipalName,
            request.Position,
            request.Role);

        person.ChangeSeniority(Seniority.From(request.Seniority));
        person.ChangeModality(Modality.From(request.Modality));
        person.UpdateAvailability(Fte.From(request.AvailableFte));
        person.UpdateMonthlyCost(request.MonthlyCost);

        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return PersonMappings.ToUpdateResponse(person);
    }
}
