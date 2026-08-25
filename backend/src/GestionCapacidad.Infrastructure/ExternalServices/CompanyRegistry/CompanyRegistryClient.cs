using System.Net;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.RestClient.Exceptions;
using GestionCapacidad.RestClient.Interfaces;

namespace GestionCapacidad.Infrastructure.ExternalServices.CompanyRegistry;

public sealed class CompanyRegistryClient(IRestClient client) : ICompanyRegistryClient
{
    public async Task<ExternalCompanyDto?> GetCompanyAsync(
        string identificationNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedIdentificationNumber = Uri.EscapeDataString(identificationNumber);

            return await client.GetAsync<ExternalCompanyDto>(
                $"/companies/{encodedIdentificationNumber}",
                cancellationToken);
        }
        catch (ExternalApiException exception) when (exception.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }
}
