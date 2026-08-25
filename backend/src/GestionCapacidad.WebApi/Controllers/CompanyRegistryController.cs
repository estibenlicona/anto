using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;

namespace GestionCapacidad.WebApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/company-registry")]
public sealed class CompanyRegistryController(
    GetExternalCompanyUseCase getExternalCompanyUseCase) : ControllerBase
{
    [HttpGet("{identificationNumber}")]
    [ProducesResponseType(typeof(GetExternalCompanyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetExternalCompanyResponse>> GetByIdentificationNumber(
        string identificationNumber,
        CancellationToken cancellationToken)
    {
        GetExternalCompanyResponse response = await getExternalCompanyUseCase.ExecuteAsync(
            new GetExternalCompanyRequest(identificationNumber),
            cancellationToken);

        return Ok(response);
    }
}
