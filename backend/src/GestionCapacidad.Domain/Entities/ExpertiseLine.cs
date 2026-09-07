using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una línea de expertise (chapter): su nombre, su código único, su lead y
/// su estado. La pertenencia de una persona a la línea no vive acá — es
/// <see cref="Person.ChapterId"/>, escalar por construcción, lo que ya
/// garantiza que una persona pertenece a lo sumo a una línea.
///
/// Que el nombre o el código no choquen con otra línea exige mirar el
/// conjunto completo, así que esa guarda no vive acá: la hace cumplir el use
/// case, igual que el nombre de <see cref="Skill"/> o de <see cref="Sprint"/>.
/// </summary>
public sealed class ExpertiseLine : AggregateRoot
{
    private ExpertiseLine()
    {
    }

    public ExpertiseLine(string name, string code, string? description)
    {
        SetDetails(name, code, description);
        Status = ExpertiseLineStatus.Active;
    }

    public string Name { get; private set; } = string.Empty;

    public string Code { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public Guid? LeadId { get; private set; }

    public ExpertiseLineStatus Status { get; private set; } = ExpertiseLineStatus.Active;

    public void UpdateDetails(string name, string code, string? description)
    {
        SetDetails(name, code, description);
        MarkUpdated();
    }

    public void SetLead(Guid? personId)
    {
        LeadId = personId;
        MarkUpdated();
    }

    public void Archive()
    {
        if (Status == ExpertiseLineStatus.Archived)
        {
            throw new DomainException("La línea ya está archivada");
        }

        Status = ExpertiseLineStatus.Archived;
        MarkUpdated();
    }

    public void Reactivate()
    {
        if (Status == ExpertiseLineStatus.Active)
        {
            throw new DomainException("La línea ya está activa");
        }

        Status = ExpertiseLineStatus.Active;
        MarkUpdated();
    }

    private void SetDetails(string name, string code, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("El nombre de la línea es obligatorio");
        }

        if (name.Trim().Length > 100)
        {
            throw new DomainException("El nombre de la línea no puede superar 100 caracteres");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código de la línea es obligatorio");
        }

        string trimmedCode = code.Trim();
        if (trimmedCode.Length > 10)
        {
            throw new DomainException("El código de la línea no puede superar 10 caracteres");
        }

        string? trimmedDescription = description?.Trim();
        if (trimmedDescription is { Length: > 200 })
        {
            throw new DomainException("La descripción de la línea no puede superar 200 caracteres");
        }

        Name = name.Trim();
        Code = trimmedCode.ToUpperInvariant();
        Description = string.IsNullOrEmpty(trimmedDescription) ? null : trimmedDescription;
    }
}
