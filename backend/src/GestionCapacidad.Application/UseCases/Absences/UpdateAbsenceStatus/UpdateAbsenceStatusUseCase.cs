using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Absences;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Absences.UpdateAbsenceStatus;

/// <summary>
/// El cuerpo del contrato. <c>Reason</c> es opcional porque sólo el rechazo lo
/// exige; aprobar no lleva motivo.
/// </summary>
public sealed record UpdateAbsenceStatusRequest(Guid Id, string Status, string? Reason);

public sealed record UpdateAbsenceStatusResponse(AbsenceDto Absence);

/// <summary>
/// Aprueba o rechaza una ausencia. Las transiciones válidas y el motivo
/// obligatorio son del agregado; acá se traducen a 400.
///
/// Sólo se aceptan <c>Approved</c> y <c>Rejected</c>: volver a
/// <c>Requested</c> no es una decisión que alguien tome, es deshacer el
/// registro de lo que pasó.
/// </summary>
public sealed class UpdateAbsenceStatusUseCase(
    IAbsenceRepository absenceRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<UpdateAbsenceStatusRequest, UpdateAbsenceStatusResponse>
{
    public async Task<UpdateAbsenceStatusResponse> ExecuteAsync(
        UpdateAbsenceStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        Absence? absence = await absenceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (absence is null)
        {
            throw new NotFoundException("Ausencia no encontrada");
        }

        try
        {
            if (string.Equals(request.Status, AbsenceStatus.Approved.Value, StringComparison.Ordinal))
            {
                absence.Approve();
            }
            else if (string.Equals(request.Status, AbsenceStatus.Rejected.Value, StringComparison.Ordinal))
            {
                absence.Reject(request.Reason ?? string.Empty);
            }
            else
            {
                throw new BadRequestException("Estado inválido");
            }
        }
        catch (DomainException exception) when (exception is not BadRequestException)
        {
            throw new BadRequestException(exception.Message);
        }

        absenceRepository.Update(absence);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        AbsenceContext context = await AbsenceContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, cancellationToken);

        (DateOnly monthStart, DateOnly monthEnd) = CreateAbsence.CreateAbsenceUseCase.MonthOf(absence.StartDate);

        return new UpdateAbsenceStatusResponse(context.ToDto(absence, monthStart, monthEnd));
    }
}
