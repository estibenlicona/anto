using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Absences;
using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Absences.GetAbsencesByMonth;

public sealed record GetAbsencesByMonthRequest(string? Month);

public sealed record GetAbsencesByMonthResponse(AbsencesMonthDto Month);

/// <summary>
/// Las ausencias que tocan un mes, con sus días y sus impactos expresados
/// contra ese mes.
///
/// El mes es obligatorio y no tiene valor por defecto: el DTO entero está
/// expresado contra un mes, así que un listado sin mes tendría que inventarse
/// el denominador de los impactos.
/// </summary>
public sealed class GetAbsencesByMonthUseCase(
    IAbsenceRepository absenceRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository) : IUseCase<GetAbsencesByMonthRequest, GetAbsencesByMonthResponse>
{
    public async Task<GetAbsencesByMonthResponse> ExecuteAsync(
        GetAbsencesByMonthRequest request,
        CancellationToken cancellationToken = default)
    {
        (DateOnly Start, DateOnly End)? bounds = BusinessDayMath.MonthBounds(request.Month);
        if (bounds is null)
        {
            throw new BadRequestException("Mes inválido: se espera month=YYYY-MM");
        }

        (DateOnly monthStart, DateOnly monthEnd) = bounds.Value;

        AbsenceContext context = await AbsenceContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, cancellationToken);

        IReadOnlyList<Absence> all = await absenceRepository.GetAllAsync(cancellationToken);

        // Una ausencia toca el mes si su rango se cruza con él, aunque sea por
        // un día: la que va del 28 al 4 del siguiente aparece en los dos meses.
        List<AbsenceDto> items =
        [
            .. all
                .Where(a => BusinessDayMath.ClampRange(a.StartDate, a.EndDate, monthStart, monthEnd) is not null)
                .OrderBy(a => a.StartDate)
                .ThenBy(a => a.Id)
                .Select(a => context.ToDto(a, monthStart, monthEnd)),
        ];

        return new GetAbsencesByMonthResponse(new AbsencesMonthDto(
            request.Month!,
            BusinessDayMath.CountBusinessDays(monthStart, monthEnd),
            items));
    }
}
