using FluentValidation;

namespace GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;

public sealed class CreateBauTaskValidator : AbstractValidator<CreateBauTaskRequest>
{
    public CreateBauTaskValidator()
    {
        RuleFor(r => r.SquadId).NotEmpty();
        RuleFor(r => r.Name).NotEmpty().MaximumLength(200);
    }
}
