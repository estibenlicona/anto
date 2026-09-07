using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un sprint del chapter: su nombre, sus fechas y los festivos de calendario
/// que le tocan (la plataforma no administra un calendario de festivos
/// todavía, así que llegan sembrados). "Sprint actual" nunca se persiste —
/// se deriva de si la fecha de hoy cae entre sus fechas.
///
/// Que el nombre no choque con otro sprint del catálogo exige mirar el
/// conjunto completo, así que esa guarda no vive acá: la hace cumplir el use
/// case, igual que el nombre de <see cref="Skill"/>.
/// </summary>
public sealed class Sprint : AggregateRoot
{
    private Sprint()
    {
    }

    public Sprint(string name, DateOnly startDate, DateOnly endDate, int holidays)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("El nombre del sprint es obligatorio");
        }

        if (endDate < startDate)
        {
            throw new DomainException("El fin del sprint no puede ser anterior al inicio");
        }

        if (holidays < 0)
        {
            throw new DomainException("Los festivos del sprint no pueden ser negativos");
        }

        Name = name.Trim();
        StartDate = startDate;
        EndDate = endDate;
        Holidays = holidays;
    }

    public string Name { get; private set; } = string.Empty;

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public int Holidays { get; private set; }

    /// <summary>Si la fecha dada cae dentro de las fechas del sprint. Nunca se persiste.</summary>
    public bool IsCurrent(DateOnly today) => today >= StartDate && today <= EndDate;
}
