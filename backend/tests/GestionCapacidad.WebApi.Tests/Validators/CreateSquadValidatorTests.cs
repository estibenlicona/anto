using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class CreateSquadValidatorTests
{
    private readonly CreateSquadValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsValidRequest()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest();

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // ── Name ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyName(string name)
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(name: name);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Name));
    }

    [Fact]
    public async Task ValidateAsync_RejectsNameExceedingMaxLength()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(name: new string('A', 201));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Name));
    }

    // ── Criticality ───────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("SuperCritical")]
    [InlineData("unknown")]
    public async Task ValidateAsync_RejectsInvalidCriticality(string criticality)
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(criticality: criticality);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Criticality));
    }

    [Theory]
    [InlineData("Critical")]
    [InlineData("High")]
    [InlineData("Medium")]
    [InlineData("Low")]
    [InlineData("critical")]
    [InlineData("HIGH")]
    public async Task ValidateAsync_AcceptsAllValidCriticalityValues(string criticality)
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(criticality: criticality);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // ── Tribe ─────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyTribe(string tribe)
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(tribe: tribe);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Tribe));
    }

    [Fact]
    public async Task ValidateAsync_RejectsTribeExceedingMaxLength()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(tribe: new string('T', 101));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Tribe));
    }

    // ── Description ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_AcceptsNullDescription()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(description: null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RejectsDescriptionExceedingMaxLength()
    {
        CreateSquadRequest request = TestDataFactory.CreateSquadRequest(description: new string('D', 501));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSquadRequest.Description));
    }
}
