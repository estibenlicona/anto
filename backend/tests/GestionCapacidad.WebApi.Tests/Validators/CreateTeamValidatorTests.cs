using FluentValidation.Results;
using GestionCapacidad.Application.UseCases.Teams.CreateTeam;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class CreateTeamValidatorTests
{
    private readonly CreateTeamValidator _validator = new();

    [Fact]
    public async Task ValidateAsync_AcceptsValidRequest()
    {
        var request = new CreateTeamRequest("Ecosistema Digital", "Equipo dueño de canales digitales");

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // ── Name ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_RejectsEmptyName(string name)
    {
        var request = new CreateTeamRequest(name, null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateTeamRequest.Name));
    }

    [Fact]
    public async Task ValidateAsync_RejectsNameExceedingMaxLength()
    {
        var request = new CreateTeamRequest(new string('A', 101), null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateTeamRequest.Name));
    }

    // ── Description ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateAsync_AcceptsNullDescription()
    {
        var request = new CreateTeamRequest("Ecosistema Digital", null);

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RejectsDescriptionExceedingMaxLength()
    {
        var request = new CreateTeamRequest("Ecosistema Digital", new string('D', 501));

        ValidationResult result = await _validator.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateTeamRequest.Description));
    }
}
