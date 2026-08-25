using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Companies.CreateCompany;

public sealed class CreateCompanyUseCase(
    ICompanyRepository companyRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateCompanyRequest> validator) : IUseCase<CreateCompanyRequest, CreateCompanyResponse>
{
    public async Task<CreateCompanyResponse> ExecuteAsync(
        CreateCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        if (await companyRepository.ExistsByIdentificationNumberAsync(request.IdentificationNumber, cancellationToken))
        {
            throw new BadRequestException("A company with the same identification number already exists.");
        }

        var company = new Company(request.Name, request.IdentificationNumber, request.Email);

        await companyRepository.AddAsync(company, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return CompanyMappings.ToCreateResponse(company);
    }
}
