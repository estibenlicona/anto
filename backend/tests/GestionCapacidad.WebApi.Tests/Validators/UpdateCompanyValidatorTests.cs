using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class UpdateCompanyValidatorTests
{
    private readonly UpdateCompanyValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_RejectsGuidEmpty()
    {
        UpdateCompanyRequest request = TestDataFactory.UpdateCompanyRequest(id: Guid.Empty);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdateCompanyRequest.Id));
    }
}
