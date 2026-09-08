using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Teams.CreateTeam;

public sealed class CreateTeamValidator : AbstractValidator<CreateTeamRequest>
{
    public CreateTeamValidator()
    {
        RuleFor(r => r.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(r => r.Description)
            .MaximumLength(500)
            .When(r => r.Description is not null);
    }
}
