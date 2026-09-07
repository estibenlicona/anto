using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Absences.CreateAbsence;
using GestionCapacidad.WebApi.Endpoints;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>
/// Tres días hábiles de una persona de 1.0 FTE en un mes de 22, repartidos
/// entre sus dos células: 3/22 = 0.136 de FTE, 60/40.
/// </summary>
public sealed class AbsenceDtoExample : IExamplesProvider<AbsenceDto>
{
    public AbsenceDto GetExamples() => new(
        Id: Guid.Parse("77777777-7777-7777-7777-777777777777"),
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        PersonName: "María González",
        ProviderName: null,
        Type: "Vacation",
        StartDate: new DateOnly(2026, 10, 5),
        EndDate: new DateOnly(2026, 10, 7),
        StartsHalfDay: false,
        EndsHalfDay: false,
        BusinessDays: 3m,
        Status: "Approved",
        RejectReason: null,
        BusinessDaysInMonth: 3m,
        SquadImpacts:
        [
            new AbsenceSquadImpactDto(
                Guid.Parse("22222222-2222-2222-2222-222222222222"), "Backend Platform", 60, 0.0818m),
            new AbsenceSquadImpactDto(
                Guid.Parse("33333333-3333-3333-3333-333333333333"), "Canales Digitales", 40, 0.0545m),
        ]);
}

public sealed class AbsencesMonthDtoExample : IExamplesProvider<AbsencesMonthDto>
{
    public AbsencesMonthDto GetExamples() => new(
        Month: "2026-10",
        MonthBusinessDays: 22m,
        Items: [new AbsenceDtoExample().GetExamples()]);
}

public sealed class CreateAbsenceRequestExample : IExamplesProvider<CreateAbsenceRequest>
{
    public CreateAbsenceRequest GetExamples() => new(
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        Type: "Vacation",
        StartDate: new DateOnly(2026, 10, 5),
        EndDate: new DateOnly(2026, 10, 7),
        StartsHalfDay: false,
        EndsHalfDay: false);
}

/// <summary>
/// El motivo sólo hace falta al rechazar; al aprobar se omite. Rechazar sirve
/// también para revertir una aprobación equivocada.
/// </summary>
public sealed class UpdateAbsenceStatusBodyExample : IExamplesProvider<UpdateAbsenceStatusBody>
{
    public UpdateAbsenceStatusBody GetExamples() =>
        new("Rejected", "Coincide con el cierre del sprint; movámoslo una semana");
}
