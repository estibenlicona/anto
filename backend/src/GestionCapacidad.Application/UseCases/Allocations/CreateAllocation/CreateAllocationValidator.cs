using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;

public sealed class CreateAllocationValidator : AbstractValidator<CreateAllocationRequest>
{
    public CreateAllocationValidator()
    {
        RuleFor(r => r.PersonId).NotEmpty();
        RuleFor(r => r.SquadId).NotEmpty();
        RuleFor(r => r.DedicationPercentage).InclusiveBetween(1, 100);
        RuleFor(r => r.BauPercentage).InclusiveBetween(0, 100);
        RuleFor(r => r.TransformationPercentage).InclusiveBetween(0, 100);
        RuleFor(r => r).Must(r => r.BauPercentage + r.TransformationPercentage == r.DedicationPercentage)
            .WithMessage("BAU% + Transformation% must equal Dedication%.")
            .OverridePropertyName("DedicationBreakdown");
    }
}
