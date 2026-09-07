namespace GestionCapacidad.Domain.Entities;

/// <summary>La actividad de un día calendario del sprint: commits, releases y features creadas.</summary>
public sealed class ActivityDaySnapshot
{
    private ActivityDaySnapshot()
    {
    }

    public ActivityDaySnapshot(DateOnly date, int commits, int releases, int features)
    {
        Date = date;
        Commits = commits;
        Releases = releases;
        Features = features;
    }

    public DateOnly Date { get; private set; }

    public int Commits { get; private set; }

    public int Releases { get; private set; }

    public int Features { get; private set; }
}
