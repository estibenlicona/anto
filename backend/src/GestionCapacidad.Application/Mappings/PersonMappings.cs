using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class PersonMappings
{
    public static PersonDto ToDto(Person person, PersonDerivedData derived) =>
        new(person.Id,
            person.Name,
            person.DocumentId,
            person.EntraObjectId,
            person.UserPrincipalName,
            person.Position,
            person.Role.Value,
            person.TechnicalLeadId,
            derived.TechnicalLeadNameOf(person),
            derived.TechnicalLeadOfCountOf(person),
            person.Level.Value,
            person.Level.Label,
            person.Seniority.Value,
            person.Seniority.Label,
            person.Modality.Value,
            person.AvailableFte.Value,
            person.MonthlyCost,
            person.StartDate,
            person.ChapterId,
            person.ProviderId,
            person.CreatedAtUtc,
            person.UpdatedAtUtc,
            derived.UtilizationOf(person),
            person.Stacks
                .Select(s => new PersonStackDto(s.Name, s.Level.Value, s.IsPrimary))
                .ToList());

    public static CreatePersonResponse ToCreateResponse(Person person, PersonDerivedData derived) =>
        new(ToDto(person, derived));

    public static UpdatePersonResponse ToUpdateResponse(Person person, PersonDerivedData derived) =>
        new(ToDto(person, derived));
}
