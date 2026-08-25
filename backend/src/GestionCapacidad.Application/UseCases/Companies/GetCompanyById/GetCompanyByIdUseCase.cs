using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Companies.GetCompanyById;

public sealed class GetCompanyByIdUseCase(ICompanyRepository companyRepository) : IUseCase<GetCompanyByIdRequest, GetCompanyByIdResponse>
{
    public async Task<GetCompanyByIdResponse> ExecuteAsync(
        GetCompanyByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Company? company = await companyRepository.GetByIdAsync(request.Id, cancellationToken);
        return company is null || !company.IsActive
            ? throw new NotFoundException("Company was not found.")
            : CompanyMappings.ToGetByIdResponse(company);
    }
}
