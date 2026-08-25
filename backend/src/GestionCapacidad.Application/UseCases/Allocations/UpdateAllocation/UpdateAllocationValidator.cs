using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;

public sealed class UpdateAllocationValidator : AbstractValidator<UpdateAllocationRequest>
{
    public UpdateAllocationValidator()
    {
        RuleFor(r => r.Id).NotEmpty();
        RuleFor(r => r.DedicationPercentage).InclusiveBetween(1, 100);
        RuleFor(r => r.BauPercentage).InclusiveBetween(0, 100);
        RuleFor(r => r.TransformationPercentage).InclusiveBetween(0, 100);
        RuleFor(r => r).Must(r => r.BauPercentage + r.TransformationPercentage == r.DedicationPercentage)
            .WithMessage("BAU% + Transformation% must equal Dedication%.")
            .OverridePropertyName("DedicationBreakdown");
    }
}
