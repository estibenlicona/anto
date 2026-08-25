using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed class CreateSquadValidator : AbstractValidator<CreateSquadRequest>
{
    public CreateSquadValidator()
    {
        RuleFor(r => r.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(r => r.Criticality)
            .NotEmpty()
            .Must(BeValidCriticality)
            .WithMessage($"Criticality must be one of: {string.Join(", ", Criticality.ValidValues)}.");

        RuleFor(r => r.Tribe)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(r => r.Description)
            .MaximumLength(500)
            .When(r => r.Description is not null);
    }

    private static bool BeValidCriticality(string value) =>
        Criticality.ValidValues.Contains(value, StringComparer.OrdinalIgnoreCase);
}
