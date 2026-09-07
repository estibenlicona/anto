using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Absences;
using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Absences.CreateAbsence;

/// <summary>El cuerpo del contrato: <c>CreateAbsenceRequest</c>.</summary>
public sealed record CreateAbsenceRequest(
    Guid PersonId,
    string Type,
    DateOnly StartDate,
    DateOnly EndDate,
    bool StartsHalfDay,
    bool EndsHalfDay);

public sealed record CreateAbsenceResponse(AbsenceDto Absence);

/// <summary>
/// Registra una ausencia; nace Solicitada.
///
/// Acá viven las dos reglas que el agregado no puede sostener solo —que la
/// persona exista y que no tenga otra ausencia cruzada—; el resto son
/// invariantes del dominio que se traducen a 400 para no responder un 500 por
/// una regla de negocio conocida.
/// </summary>
public sealed class CreateAbsenceUseCase(
    IAbsenceRepository absenceRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<CreateAbsenceRequest, CreateAbsenceResponse>
{
    public async Task<CreateAbsenceResponse> ExecuteAsync(
        CreateAbsenceRequest request,
        CancellationToken cancellationToken = default)
    {
        AbsenceType type;
        try
        {
            type = AbsenceType.From(request.Type);
        }
        catch (DomainException)
        {
            throw new BadRequestException("Datos de ausencia inválidos");
        }

        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new BadRequestException("La persona no existe");
        }

        Absence absence;
        try
        {
            absence = new Absence(
                request.PersonId,
                type,
                request.StartDate,
                request.EndDate,
                request.StartsHalfDay,
                request.EndsHalfDay);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        // El solape se mira sólo contra las no rechazadas: una rechazada no
        // bloquea volver a registrar el mismo rango, que es justamente el
        // camino para corregir un registro equivocado.
        IReadOnlyList<Absence> own = await absenceRepository.GetByPersonAsync(request.PersonId, cancellationToken);
        bool overlaps = own.Any(other =>
            other.Status != AbsenceStatus.Rejected &&
            BusinessDayMath.ClampRange(
                other.StartDate, other.EndDate, absence.StartDate, absence.EndDate) is not null);

        if (overlaps)
        {
            throw new BadRequestException("La persona ya tiene una ausencia que se cruza con ese rango");
        }

        await absenceRepository.AddAsync(absence, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        AbsenceContext context = await AbsenceContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, cancellationToken);

        // Se responde contra el mes en que empieza: es el mes que la pantalla
        // está mirando cuando registra.
        (DateOnly monthStart, DateOnly monthEnd) = MonthOf(absence.StartDate);

        return new CreateAbsenceResponse(context.ToDto(absence, monthStart, monthEnd));
    }

    internal static (DateOnly Start, DateOnly End) MonthOf(DateOnly date)
    {
        var start = new DateOnly(date.Year, date.Month, 1);
        return (start, start.AddMonths(1).AddDays(-1));
    }
}
