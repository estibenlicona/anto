using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class UpdateSquadValidatorTests
{
    private readonly UpdateSquadValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsValidRequest()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest();

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // ── Id ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_RejectsEmptyId()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(id: Guid.Empty);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Id));
    }

    // ── Name ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyName(string name)
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(name: name);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Name));
    }

    [Fact]
    public async Task ValidateAsync_RejectsNameExceedingMaxLength()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(name: new string('A', 201));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Name));
    }

    // ── Criticality ───────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("SuperCritical")]
    public async Task ValidateAsync_RejectsInvalidCriticality(string criticality)
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(criticality: criticality);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Criticality));
    }

    // ── Tribe ─────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyTribe(string tribe)
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(tribe: tribe);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Tribe));
    }

    // ── Description ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_AcceptsNullDescription()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(description: null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RejectsDescriptionExceedingMaxLength()
    {
        UpdateSquadRequest request = TestDataFactory.UpdateSquadRequest(description: new string('D', 501));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSquadRequest.Description));
    }
}
