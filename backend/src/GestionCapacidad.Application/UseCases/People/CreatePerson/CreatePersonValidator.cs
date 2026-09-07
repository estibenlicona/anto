using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.People.CreatePerson;

public sealed class CreatePersonValidator : AbstractValidator<CreatePersonRequest>
{
    public CreatePersonValidator()
    {
        RuleFor(r => r.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(r => r.DocumentId)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(r => r.UserPrincipalName)
            .NotEmpty()
            .MaximumLength(250);

        RuleFor(r => r.Position)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(r => r.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(v => PersonRole.ValidValues.Any(r => string.Equals(r.Value, v, StringComparison.Ordinal)))
            .WithMessage($"Role must be one of: {string.Join(", ", PersonRole.ValidValues.Select(r => r.Value))}.");

        RuleFor(r => r.Level)
            .InclusiveBetween(Level.Min, Level.Max)
            .WithMessage($"Level must be between {Level.Min} and {Level.Max} (escala Tuya).");

        RuleFor(r => r.Seniority)
            .NotEmpty()
            .WithMessage("Seniority is required.")
            .Must(v => Seniority.ValidValues.Any(s => string.Equals(s.Value, v, StringComparison.Ordinal)))
            .WithMessage($"Seniority must be one of: {string.Join(", ", Seniority.ValidValues.Select(s => s.Value))}.");

        RuleFor(r => r.Modality)
            .NotEmpty()
            .Must(v => Modality.ValidValues.Contains(v, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Modality must be one of: {string.Join(", ", Modality.ValidValues)}.");

        RuleFor(r => r.AvailableFte)
            .InclusiveBetween(0f, 1f)
            .WithMessage("Available FTE must be between 0.0 and 1.0.");

        RuleFor(r => r.MonthlyCost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Monthly cost must be zero or greater.");
    }
}
