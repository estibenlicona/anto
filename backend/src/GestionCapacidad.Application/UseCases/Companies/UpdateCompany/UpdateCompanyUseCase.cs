using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Companies.UpdateCompany;

public sealed class UpdateCompanyUseCase(
    ICompanyRepository companyRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateCompanyRequest> validator) : IUseCase<UpdateCompanyRequest, UpdateCompanyResponse>
{
    public async Task<UpdateCompanyResponse> ExecuteAsync(
        UpdateCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        Company? company = await companyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (company is null || !company.IsActive)
        {
            throw new NotFoundException("Company was not found.");
        }

        var identificationChanged = !string.Equals(
            company.IdentificationNumber,
            request.IdentificationNumber,
            StringComparison.OrdinalIgnoreCase);

        if (identificationChanged)
        {
            Company? duplicatedCompany = await companyRepository.GetByIdentificationNumberAsync(
                request.IdentificationNumber,
                cancellationToken);

            if (duplicatedCompany is not null && duplicatedCompany.Id != company.Id)
            {
                throw new BadRequestException("A company with the same identification number already exists.");
            }
        }

        company.Update(request.Name, request.IdentificationNumber, request.Email);

        companyRepository.Update(company);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return CompanyMappings.ToUpdateResponse(company);
    }
}
