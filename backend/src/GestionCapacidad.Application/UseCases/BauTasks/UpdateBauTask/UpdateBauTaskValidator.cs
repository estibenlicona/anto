using FluentValidation;

namespace GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;

public sealed class UpdateBauTaskValidator : AbstractValidator<UpdateBauTaskRequest>
{
    public UpdateBauTaskValidator()
    {
        RuleFor(r => r.SquadId).NotEmpty();
        RuleFor(r => r.TaskId).NotEmpty();
        RuleFor(r => r.Name).NotEmpty().MaximumLength(200);
    }
}
