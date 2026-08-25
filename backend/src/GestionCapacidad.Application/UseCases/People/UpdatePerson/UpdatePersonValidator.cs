using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.People.UpdatePerson;

public sealed class UpdatePersonValidator : AbstractValidator<UpdatePersonRequest>
{
    public UpdatePersonValidator()
    {
        RuleFor(r => r.Id)
            .NotEmpty();

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
            .MaximumLength(100);

        RuleFor(r => r.Seniority)
            .InclusiveBetween(Seniority.Min, Seniority.Max)
            .WithMessage($"Seniority must be between {Seniority.Min} and {Seniority.Max} (escala Tuya).");

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
