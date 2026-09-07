using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.People.CreatePerson;

public sealed class CreatePersonUseCase(
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreatePersonRequest> validator) : IUseCase<CreatePersonRequest, CreatePersonResponse>
{
    public async Task<CreatePersonResponse> ExecuteAsync(
        CreatePersonRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));

        if (await personRepository.ExistsByDocumentIdAsync(request.DocumentId, cancellationToken))
            throw new BadRequestException($"A person with document ID '{request.DocumentId}' already exists.");

        if (await personRepository.ExistsByUserPrincipalNameAsync(request.UserPrincipalName, cancellationToken))
            throw new BadRequestException($"A person with UPN '{request.UserPrincipalName}' already exists.");

        if (request.TechnicalLeadId is Guid leadId &&
            await personRepository.GetByIdAsync(leadId, cancellationToken) is null)
            throw new BadRequestException($"Technical lead with id '{leadId}' was not found.");

        var person = new Person(
            request.Name,
            request.DocumentId,
            request.EntraObjectId,
            request.UserPrincipalName,
            request.Position,
            PersonRole.From(request.Role),
            Level.From(request.Level),
            Seniority.From(request.Seniority),
            Modality.From(request.Modality),
            Fte.From(request.AvailableFte),
            request.MonthlyCost,
            request.StartDate,
            request.TechnicalLeadId);

        await personRepository.AddAsync(person, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        PersonDerivedData derived = PersonDerivedData.Build(
            await personRepository.GetAllAsync(cancellationToken),
            await allocationRepository.GetAllAsync(cancellationToken));

        return PersonMappings.ToCreateResponse(person, derived);
    }
}
