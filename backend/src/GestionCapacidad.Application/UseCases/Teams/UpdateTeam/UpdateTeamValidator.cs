using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Teams.UpdateTeam;

public sealed class UpdateTeamValidator : AbstractValidator<UpdateTeamRequest>
{
    public UpdateTeamValidator()
    {
        RuleFor(r => r.Id)
            .NotEmpty();

        RuleFor(r => r.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(r => r.Description)
            .MaximumLength(500)
            .When(r => r.Description is not null);
    }
}
