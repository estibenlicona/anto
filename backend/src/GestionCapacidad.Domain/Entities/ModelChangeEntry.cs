using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una entrada del historial de una versión: qué cambió, cuándo y quién lo
/// informó.
///
/// El autor **viaja en la petición** desde la sesión del cliente: la interfaz
/// de programación todavía no valida el token de quien llama, así que la firma
/// es declarativa y no una identidad verificada. Se guarda igual porque un
/// historial sin autor pierde la mitad de su valor, y se muestra como lo que es
/// para que nadie lo lea como una firma.
/// </summary>
public sealed class ModelChangeEntry
{
    private ModelChangeEntry()
    {
    }

    public ModelChangeEntry(DateTime occurredAtUtc, string author, string section, string summary)
    {
        if (string.IsNullOrWhiteSpace(author))
        {
            throw new DomainException("Un cambio de configuración no se registra sin autor.");
        }

        if (author.Trim().Length > 120)
        {
            throw new DomainException("El autor no puede superar 120 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(section))
        {
            throw new DomainException("El cambio tiene que decir sobre qué sección fue.");
        }

        if (section.Trim().Length > 50)
        {
            throw new DomainException("La sección no puede superar 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(summary))
        {
            throw new DomainException("El cambio tiene que decir qué cambió.");
        }

        if (summary.Trim().Length > 500)
        {
            throw new DomainException("El resumen del cambio no puede superar 500 caracteres.");
        }

        OccurredAtUtc = occurredAtUtc;
        Author = author.Trim();
        Section = section.Trim();
        Summary = summary.Trim();
    }

    public DateTime OccurredAtUtc { get; private set; }

    /// <summary>Quién dijo ser, no quién fue: la firma es declarativa.</summary>
    public string Author { get; private set; } = string.Empty;

    public string Section { get; private set; } = string.Empty;

    public string Summary { get; private set; } = string.Empty;
}
