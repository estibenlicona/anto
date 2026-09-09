using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un modelo de estimación y sus versiones. El modelo es apenas el contenedor
/// —su nombre y la fase a la que sirve—; lo que se edita, se publica y se lee
/// son las versiones.
///
/// A lo sumo una versión está <see cref="ModelVersionStatus.Vigente"/>: es la
/// que usan las estimaciones nuevas. Publicar una archiva la anterior, y nunca
/// se borra ninguna — una versión borrada dejaría sin explicación a las
/// estimaciones que calculó (design.md — D3).
/// </summary>
public sealed class EstimationModel : AggregateRoot
{
    private readonly List<ModelVersion> _versions = [];

    private EstimationModel()
    {
    }

    public EstimationModel(string name, EstimationPhase phase)
    {
        ArgumentNullException.ThrowIfNull(phase);

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("El nombre del modelo es obligatorio.");
        }

        if (name.Trim().Length > 120)
        {
            throw new DomainException("El nombre del modelo no puede superar 120 caracteres.");
        }

        Name = name.Trim();
        Phase = phase;
    }

    public string Name { get; private set; } = string.Empty;

    public EstimationPhase Phase { get; private set; } = EstimationPhase.Inicial;

    /// <summary>Las versiones, de la más vieja a la más nueva.</summary>
    public IReadOnlyList<ModelVersion> Versions => _versions.AsReadOnly();

    /// <summary>La versión con la que se calculan las estimaciones nuevas, si hay alguna.</summary>
    public ModelVersion? CurrentVersion => _versions.FirstOrDefault(v => v.Status.IsCurrent);

    /// <summary>Crea la primera versión, vacía y en borrador.</summary>
    public ModelVersion StartFirstVersion(string author, DateTime atUtc)
    {
        if (_versions.Count > 0)
        {
            throw new DomainException($"El modelo {Name} ya tiene versiones.");
        }

        var version = new ModelVersion(1, author, atUtc);
        _versions.Add(version);
        MarkUpdated();
        return version;
    }

    /// <summary>
    /// Crea una versión nueva copiando el contenido de otra. Es la única salida
    /// cuando alguien quiere cambiar algo de una versión publicada, y por eso se
    /// ofrece en el mismo lugar donde se niega la edición.
    /// </summary>
    public ModelVersion CreateVersionFrom(int sourceNumber, string author, DateTime atUtc)
    {
        ModelVersion source = VersionOf(sourceNumber);

        if (_versions.Any(v => v.Status.IsDraft))
        {
            throw new DomainException(
                $"El modelo {Name} ya tiene un borrador abierto. Se publica o se descarta antes de abrir otro.");
        }

        var draft = new ModelVersion(_versions.Max(v => v.Number) + 1, author, atUtc);
        source.CopyContentTo(draft);
        _versions.Add(draft);
        MarkUpdated();
        return draft;
    }

    /// <summary>
    /// Publica un borrador: pasa a vigente desde la fecha indicada y archiva la
    /// que regía. <paramref name="impediments"/> son los chequeos de validación
    /// que no pasaron; con al menos uno, no se publica.
    ///
    /// La validación se calcula afuera y se pasa acá para que el agregado no
    /// dependa del servicio que la corre, pero la decisión de bloquear es del
    /// agregado: nadie publica saltándose el chequeo.
    /// </summary>
    public void Publish(
        int versionNumber,
        DateOnly effectiveFrom,
        string note,
        string author,
        IReadOnlyCollection<string> impediments,
        DateTime atUtc)
    {
        ArgumentNullException.ThrowIfNull(impediments);

        if (string.IsNullOrWhiteSpace(author))
        {
            throw new DomainException("Publicar una versión exige el autor.");
        }

        ModelVersion draft = VersionOf(versionNumber);

        if (!draft.Status.IsDraft)
        {
            throw new DomainException($"La versión {versionNumber} está {draft.Status} y ya no se publica.");
        }

        if (impediments.Count > 0)
        {
            throw new DomainException(
                $"La versión {versionNumber} no se puede publicar: quedan {impediments.Count} impedimentos " +
                $"({string.Join(", ", impediments)}).");
        }

        ModelVersion? previous = CurrentVersion;
        previous?.Archive(effectiveFrom, author, atUtc);

        draft.MarkCurrent(effectiveFrom, note, author, atUtc);
        MarkUpdated();
    }

    /// <summary>
    /// Pone un borrador como vigente **sin pasar por la validación**. Es el
    /// camino de la migración de datos y de nadie más: la versión 1 describe lo
    /// que el sistema ya venía haciendo, no una propuesta, así que exigirle los
    /// nueve chequeos la dejaría sin poder existir por reglas que se
    /// introdujeron después de que calculara sus estimaciones.
    ///
    /// Quien la usa tiene la obligación de dejar registrado qué chequeos no
    /// pasa, para que quien arme la versión siguiente sepa qué arreglar antes
    /// de publicar (design.md — Risks).
    /// </summary>
    public void AdoptAsCurrent(
        int versionNumber,
        DateOnly effectiveFrom,
        string note,
        string author,
        DateTime atUtc)
    {
        if (CurrentVersion is not null)
        {
            throw new DomainException(
                $"El modelo {Name} ya tiene la versión {CurrentVersion.Number} vigente; " +
                "adoptar es sólo para el primer arranque.");
        }

        VersionOf(versionNumber).MarkCurrent(effectiveFrom, note, author, atUtc);
        MarkUpdated();
    }

    public ModelVersion VersionOf(int number) =>
        _versions.FirstOrDefault(v => v.Number == number)
        ?? throw new DomainException($"El modelo {Name} no tiene la versión {number}.");
}
