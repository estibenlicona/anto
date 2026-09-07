using System.Text.RegularExpressions;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// El calendario de sprints del chapter: cuánto dura un sprint, cuántas horas
/// aporta un colaborador a jornada completa, a qué hora se sella el snapshot
/// del sprint y sobre cuántos sprints mira el histórico. Agregado de fila
/// única — hay un solo calendario vigente — que se reemplaza en bloque.
///
/// Las horas por sprint son un factor de lectura de la capacidad, no un parte
/// de trabajo: la plataforma no registra horas.
/// </summary>
public sealed partial class SprintConfiguration : AggregateRoot
{
    public const int MinWeeks = 1;
    public const int MaxWeeks = 4;
    public const int MinSprintsPerQuarter = 4;
    public const int MaxSprintsPerQuarter = 8;
    public const decimal MinHoursPerSprint = 20m;
    public const decimal MaxHoursPerSprint = 400m;
    public const int MinHistoryWindowSprints = 3;
    public const int MaxHistoryWindowSprints = 12;
    public const int MinMinHistorySprints = 2;
    public const int MaxMinHistorySprints = 6;

    private SprintConfiguration()
    {
    }

    public SprintConfiguration(
        int weeks,
        int sprintsPerQuarter,
        decimal hoursPerSprint,
        string sprintCloseTime,
        int historyWindowSprints,
        int minHistorySprints)
    {
        Set(weeks, sprintsPerQuarter, hoursPerSprint, sprintCloseTime, historyWindowSprints, minHistorySprints);
    }

    public int Weeks { get; private set; }

    public int SprintsPerQuarter { get; private set; }

    /// <summary>Horas de un colaborador a jornada completa en un sprint, sin descuentos.</summary>
    public decimal HoursPerSprint { get; private set; }

    /// <summary>Hora local <c>HH:mm</c> (24 h) en que se sella el snapshot del sprint.</summary>
    public string SprintCloseTime { get; private set; } = "23:00";

    /// <summary>Cuántos sprints sellados entran en la mediana histórica y la tendencia.</summary>
    public int HistoryWindowSprints { get; private set; }

    /// <summary>Cuántos sprints sellados hacen falta para que la señal de balance se pueda calcular.</summary>
    public int MinHistorySprints { get; private set; }

    public void Update(
        int weeks,
        int sprintsPerQuarter,
        decimal hoursPerSprint,
        string sprintCloseTime,
        int historyWindowSprints,
        int minHistorySprints)
    {
        Set(weeks, sprintsPerQuarter, hoursPerSprint, sprintCloseTime, historyWindowSprints, minHistorySprints);
        MarkUpdated();
    }

    private void Set(
        int weeks,
        int sprintsPerQuarter,
        decimal hoursPerSprint,
        string sprintCloseTime,
        int historyWindowSprints,
        int minHistorySprints)
    {
        EnsureInRange(weeks, MinWeeks, MaxWeeks, "Las semanas por sprint");
        EnsureInRange(sprintsPerQuarter, MinSprintsPerQuarter, MaxSprintsPerQuarter, "Los sprints por quarter");
        EnsureInRange(hoursPerSprint, MinHoursPerSprint, MaxHoursPerSprint, "Las horas por sprint");
        EnsureInRange(historyWindowSprints, MinHistoryWindowSprints, MaxHistoryWindowSprints, "La ventana de histórico");
        EnsureInRange(minHistorySprints, MinMinHistorySprints, MaxMinHistorySprints, "El mínimo de sprints para evaluar");

        if (sprintCloseTime is null || !CloseTimePattern().IsMatch(sprintCloseTime))
        {
            throw new DomainException("La hora de cierre del sprint debe tener el formato HH:mm en 24 horas.");
        }

        // Exigir más sprints sellados de los que la ventana mira no tiene sentido.
        if (minHistorySprints > historyWindowSprints)
        {
            throw new DomainException(
                "El mínimo de sprints para evaluar no puede superar la ventana de histórico.");
        }

        Weeks = weeks;
        SprintsPerQuarter = sprintsPerQuarter;
        HoursPerSprint = hoursPerSprint;
        SprintCloseTime = sprintCloseTime;
        HistoryWindowSprints = historyWindowSprints;
        MinHistorySprints = minHistorySprints;
    }

    private static void EnsureInRange(decimal value, decimal min, decimal max, string fieldName)
    {
        if (value < min || value > max)
        {
            throw new DomainException($"{fieldName} deben estar entre {min:0.##} y {max:0.##}. Recibido: {value:0.##}.");
        }
    }

    [GeneratedRegex(@"^([01]\d|2[0-3]):[0-5]\d$")]
    private static partial Regex CloseTimePattern();
}
