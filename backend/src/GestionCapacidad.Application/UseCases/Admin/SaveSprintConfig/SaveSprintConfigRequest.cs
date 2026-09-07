namespace GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;

/// <summary>El cuerpo del <c>PUT /admin/sprint-config</c>, tal cual lo manda la pantalla.</summary>
public sealed record SaveSprintConfigRequest(
    int Weeks,
    int SprintsPerQuarter,
    decimal HoursPerSprint,
    string SprintCloseTime,
    int HistoryWindowSprints,
    int MinHistorySprints);
