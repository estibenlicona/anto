using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Companies.GetCompanies;

public sealed class GetCompaniesUseCase(ICompanyRepository companyRepository) : IUseCase<GetCompaniesResponse>
{
    public async Task<GetCompaniesResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Company> companies = await companyRepository.GetAllAsync(cancellationToken);
        var activeCompanies = companies
            .Where(company => company.IsActive)
            .OrderBy(company => company.Name)
            .Select(CompanyMappings.ToDto)
            .ToList();

        return new GetCompaniesResponse(activeCompanies);
    }
}
