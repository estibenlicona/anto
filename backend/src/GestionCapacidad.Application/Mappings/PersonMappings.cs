using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class PersonMappings
{
    public static PersonDto ToDto(Person person) =>
        new(person.Id,
            person.Name,
            person.DocumentId,
            person.EntraObjectId,
            person.UserPrincipalName,
            person.Position,
            person.Role,
            person.Seniority.Value,
            person.Seniority.Label,
            person.Modality.Value,
            person.AvailableFte.Value,
            person.MonthlyCost,
            person.StartDate,
            person.ChapterId,
            person.ProviderId,
            person.CreatedAtUtc,
            person.UpdatedAtUtc);

    public static CreatePersonResponse ToCreateResponse(Person person) =>
        new(ToDto(person));

    public static UpdatePersonResponse ToUpdateResponse(Person person) =>
        new(ToDto(person));
}
