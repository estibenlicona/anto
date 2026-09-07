using FluentValidation;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;

public sealed class CreateInitiativeValidator : AbstractValidator<CreateInitiativeRequest>
{
    public CreateInitiativeValidator()
    {
        RuleFor(r => r.Name)
            .NotEmpty()
            .WithMessage("El nombre de la iniciativa es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre de la iniciativa no puede superar 200 caracteres.");

        RuleFor(r => r.SquadId)
            .NotEmpty()
            .WithMessage("La célula es obligatoria.");

        RuleFor(r => r.ProductOwner)
            .NotEmpty()
            .WithMessage("El product owner es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El product owner no puede superar 100 caracteres.");

        RuleFor(r => r.TargetMonths)
            .InclusiveBetween(Initiative.MinTargetMonths, Initiative.MaxTargetMonths)
            .WithMessage(
                $"El plazo debe estar entre {Initiative.MinTargetMonths} y {Initiative.MaxTargetMonths} meses.");
    }
}
