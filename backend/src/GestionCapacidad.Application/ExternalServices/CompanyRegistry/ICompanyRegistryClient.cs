namespace GestionCapacidad.Application.ExternalServices.CompanyRegistry;

public interface ICompanyRegistryClient
{
    Task<ExternalCompanyDto?> GetCompanyAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default);
}
