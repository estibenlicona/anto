using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

public sealed class Company : Entity
{
    private Company()
    {
    }

    public Company(string name, string identificationNumber, string email)
    {
        SetDetails(name, identificationNumber, email);
        IsActive = true;
    }

    public string Name { get; private set; } = string.Empty;

    public string IdentificationNumber { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public bool IsActive { get; private set; }

    public void Update(string name, string identificationNumber, string email)
    {
        SetDetails(name, identificationNumber, email);
        MarkUpdated();
    }

    public void Activate()
    {
        if (IsActive)
        {
            return;
        }

        IsActive = true;
        MarkUpdated();
    }

    public void Deactivate()
    {
        if (!IsActive)
        {
            return;
        }

        IsActive = false;
        MarkUpdated();
    }

    private void SetDetails(string name, string identificationNumber, string email)
    {
        EnsureRequired(name, nameof(Name), 200);
        EnsureRequired(identificationNumber, nameof(IdentificationNumber), 50);
        EnsureRequired(email, nameof(Email), 250);

        Name = name.Trim();
        IdentificationNumber = identificationNumber.Trim();
        Email = email.Trim();
    }

    private static void EnsureRequired(string value, string fieldName, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{fieldName} is required.");
        }

        if (value.Length > maxLength)
        {
            throw new DomainException($"{fieldName} cannot exceed {maxLength} characters.");
        }
    }
}
