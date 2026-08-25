using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;

public sealed class UpdateInitiativeValidator : AbstractValidator<UpdateInitiativeRequest>
{
    public UpdateInitiativeValidator()
    {
        RuleFor(r => r.Id).NotEmpty();
        RuleFor(r => r.Name).NotEmpty().MaximumLength(300);
        RuleFor(r => r.Type)
            .NotEmpty()
            .Must(v => InitiativeType.ValidValues.Contains(v, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Type must be one of: {string.Join(", ", InitiativeType.ValidValues)}.");
        RuleFor(r => r.DeadlineMonths).GreaterThanOrEqualTo(1);
    }
}
