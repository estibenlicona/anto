using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class CreateCompanyValidatorTests
{
    private readonly CreateCompanyValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsAValidRequest()
    {
        CreateCompanyRequest request = TestDataFactory.CreateCompanyRequest();

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RejectsAnEmptyName()
    {
        CreateCompanyRequest request = TestDataFactory.CreateCompanyRequest(name: string.Empty);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(CreateCompanyRequest.Name));
    }

    [Fact]
    public async Task ValidateAsync_RejectsAnInvalidEmail()
    {
        CreateCompanyRequest request = TestDataFactory.CreateCompanyRequest(email: "invalid-email");

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(CreateCompanyRequest.Email));
    }
}
