using FluentValidation;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;

public sealed class SaveSprintConfigValidator : AbstractValidator<SaveSprintConfigRequest>
{
    public SaveSprintConfigValidator()
    {
        RuleFor(r => r.Weeks)
            .InclusiveBetween(SprintConfiguration.MinWeeks, SprintConfiguration.MaxWeeks)
            .WithMessage(
                $"Las semanas por sprint deben estar entre {SprintConfiguration.MinWeeks} y {SprintConfiguration.MaxWeeks}.");

        RuleFor(r => r.SprintsPerQuarter)
            .InclusiveBetween(SprintConfiguration.MinSprintsPerQuarter, SprintConfiguration.MaxSprintsPerQuarter)
            .WithMessage(
                $"Los sprints por quarter deben estar entre {SprintConfiguration.MinSprintsPerQuarter} y {SprintConfiguration.MaxSprintsPerQuarter}.");

        RuleFor(r => r.HoursPerSprint)
            .InclusiveBetween(SprintConfiguration.MinHoursPerSprint, SprintConfiguration.MaxHoursPerSprint)
            .WithMessage(
                $"Las horas por sprint deben estar entre {SprintConfiguration.MinHoursPerSprint:0.##} y {SprintConfiguration.MaxHoursPerSprint:0.##}.");

        RuleFor(r => r.SprintCloseTime)
            .NotEmpty()
            .Matches(@"^([01]\d|2[0-3]):[0-5]\d$")
            .WithMessage("La hora de cierre del sprint debe tener el formato HH:mm en 24 horas.");

        RuleFor(r => r.HistoryWindowSprints)
            .InclusiveBetween(SprintConfiguration.MinHistoryWindowSprints, SprintConfiguration.MaxHistoryWindowSprints)
            .WithMessage(
                $"La ventana de histórico debe estar entre {SprintConfiguration.MinHistoryWindowSprints} y {SprintConfiguration.MaxHistoryWindowSprints} sprints.");

        RuleFor(r => r.MinHistorySprints)
            .InclusiveBetween(SprintConfiguration.MinMinHistorySprints, SprintConfiguration.MaxMinHistorySprints)
            .WithMessage(
                $"El mínimo de sprints para evaluar debe estar entre {SprintConfiguration.MinMinHistorySprints} y {SprintConfiguration.MaxMinHistorySprints}.");

        // Exigir más sprints sellados de los que la ventana mira no tiene sentido.
        RuleFor(r => r.MinHistorySprints)
            .LessThanOrEqualTo(r => r.HistoryWindowSprints)
            .WithMessage("El mínimo de sprints para evaluar no puede superar la ventana de histórico.");
    }
}
