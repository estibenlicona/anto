using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Teams.UpdateTeam;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class UpdateTeamValidatorTests
{
    private readonly UpdateTeamValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsValidRequest()
    {
        var request = new UpdateTeamRequest(Guid.NewGuid(), "Ecosistema Digital", "Descripción");

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // ── Id ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_RejectsEmptyId()
    {
        var request = new UpdateTeamRequest(Guid.Empty, "Ecosistema Digital", null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateTeamRequest.Id));
    }

    // ── Name ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyName(string name)
    {
        var request = new UpdateTeamRequest(Guid.NewGuid(), name, null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateTeamRequest.Name));
    }

    [Fact]
    public async Task ValidateAsync_RejectsNameExceedingMaxLength()
    {
        var request = new UpdateTeamRequest(Guid.NewGuid(), new string('A', 101), null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateTeamRequest.Name));
    }

    // ── Description ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_AcceptsNullDescription()
    {
        var request = new UpdateTeamRequest(Guid.NewGuid(), "Ecosistema Digital", null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RejectsDescriptionExceedingMaxLength()
    {
        var request = new UpdateTeamRequest(Guid.NewGuid(), "Ecosistema Digital", new string('D', 501));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateTeamRequest.Description));
    }
}
