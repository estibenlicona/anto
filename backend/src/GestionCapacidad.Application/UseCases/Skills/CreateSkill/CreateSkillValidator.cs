using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Skills.CreateSkill;

public sealed class CreateSkillValidator : AbstractValidator<CreateSkillRequest>
{
    public CreateSkillValidator()
    {
        RuleFor(r => r.Name)
            .NotEmpty()
            .WithMessage("El nombre de la habilidad es obligatorio")
            .MaximumLength(200);

        RuleFor(r => r.Group)
            .Must(BeValidGroup)
            .WithMessage("El grupo debe ser humana o técnica");
    }

    private static bool BeValidGroup(string value) =>
        SkillGroup.ValidValues.Any(g => string.Equals(g.Value, value, StringComparison.Ordinal));
}
