using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Billing.RemoveBillingAdjustment;

public sealed record RemoveBillingAdjustmentRequest(Guid Id);

public sealed record RemoveBillingAdjustmentResponse(PrefactureDto Prefacture);

/// <summary>Quita el ajuste del período.</summary>
public sealed class RemoveBillingAdjustmentUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork) : IUseCase<RemoveBillingAdjustmentRequest, RemoveBillingAdjustmentResponse>
{
    public async Task<RemoveBillingAdjustmentResponse> ExecuteAsync(
        RemoveBillingAdjustmentRequest request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        try
        {
            prefacture.ClearAdjustment();
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        prefactureRepository.Update(prefacture);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        return new RemoveBillingAdjustmentResponse(context.ToDto(prefacture));
    }
}
