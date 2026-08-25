using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class CreatePersonValidatorTests
{
    private readonly CreatePersonValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsValidRequest()
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest());
        Assert.True(result.IsValid);
    }

    // ── Name ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyName(string name)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(name: name));
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreatePersonRequest.Name));
    }

    // ── Seniority ─────────────────────────────────────────────────────────────

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    public async Task ValidateAsync_AcceptsValidSeniorityValues(int seniority)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(seniority: seniority));
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    [InlineData(-1)]
    public async Task ValidateAsync_RejectsInvalidSeniority(int seniority)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(seniority: seniority));
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreatePersonRequest.Seniority));
    }

    // ── Modality ──────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("Remote")]
    [InlineData("Hybrid")]
    [InlineData("OnSite")]
    [InlineData("hybrid")]
    public async Task ValidateAsync_AcceptsAllValidModalityValues(string modality)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(modality: modality));
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("FullRemote")]
    public async Task ValidateAsync_RejectsInvalidModality(string modality)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(modality: modality));
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreatePersonRequest.Modality));
    }

    // ── AvailableFte ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData(0.0f)]
    [InlineData(0.5f)]
    [InlineData(1.0f)]
    public async Task ValidateAsync_AcceptsValidFte(float fte)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(availableFte: fte));
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(-0.1f)]
    [InlineData(1.1f)]
    public async Task ValidateAsync_RejectsInvalidFte(float fte)
    {
        ValidationResult result = await _validator.ValidateAsync(TestDataFactory.CreatePersonRequest(availableFte: fte));
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreatePersonRequest.AvailableFte));
    }
}
