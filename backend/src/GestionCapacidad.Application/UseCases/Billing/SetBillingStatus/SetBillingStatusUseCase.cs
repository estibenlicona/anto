using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Billing.SetBillingStatus;

public sealed record SetBillingStatusCommand(Guid Id, string Status, string? Note, string? Reason);

public sealed record SetBillingStatusResponse(PrefactureDto Prefacture);

/// <summary>
/// Aprueba (con el descuento vigente, que queda congelado) u objeta una
/// prefactura. Sólo <c>Approved</c> y <c>Objected</c> son transiciones
/// válidas acá; cualquier otro valor es un 400 genérico, como en el mock.
/// </summary>
public sealed class SetBillingStatusUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IUseCase<SetBillingStatusCommand, SetBillingStatusResponse>
{
    public async Task<SetBillingStatusResponse> ExecuteAsync(
        SetBillingStatusCommand request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        try
        {
            if (string.Equals(request.Status, BillingStatus.Approved.Value, StringComparison.Ordinal))
            {
                AbsenceDiscount? discount = context.DiscountFor(prefacture.PersonId, prefacture.Period, prefacture.MonthlyCost);
                prefacture.Approve(discount, request.Note, now);
            }
            else if (string.Equals(request.Status, BillingStatus.Objected.Value, StringComparison.Ordinal))
            {
                prefacture.Object(request.Reason ?? string.Empty, now);
            }
            else
            {
                throw new BadRequestException("Transición de estado inválida");
            }
        }
        catch (DomainException exception) when (exception is not BadRequestException)
        {
            throw new BadRequestException(exception.Message);
        }

        prefactureRepository.Update(prefacture);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SetBillingStatusResponse(context.ToDto(prefacture));
    }
}
