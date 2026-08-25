using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;

public sealed class GetExternalCompanyUseCase(
    ICompanyRegistryClient companyRegistryClient) : IUseCase<GetExternalCompanyRequest, GetExternalCompanyResponse>
{
    public async Task<GetExternalCompanyResponse> ExecuteAsync(
        GetExternalCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        ExternalCompanyDto? company = await companyRegistryClient.GetCompanyAsync(
            request.IdentificationNumber,
            cancellationToken);

        return company is null
            ? throw new NotFoundException("External company was not found.")
            : new GetExternalCompanyResponse(
            company.IdentificationNumber,
            company.Name,
            company.Status);
    }
}
