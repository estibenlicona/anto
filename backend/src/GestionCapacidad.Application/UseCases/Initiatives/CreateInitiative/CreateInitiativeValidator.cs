using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;

public sealed class CreateInitiativeValidator : AbstractValidator<CreateInitiativeRequest>
{
    public CreateInitiativeValidator()
    {
        RuleFor(r => r.SquadId).NotEmpty();
        RuleFor(r => r.Name).NotEmpty().MaximumLength(300);
        RuleFor(r => r.Type)
            .NotEmpty()
            .Must(v => InitiativeType.ValidValues.Contains(v, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Type must be one of: {string.Join(", ", InitiativeType.ValidValues)}.");
        RuleFor(r => r.DeadlineMonths).GreaterThanOrEqualTo(1)
            .WithMessage("Deadline must be at least 1 month.");
    }
}
