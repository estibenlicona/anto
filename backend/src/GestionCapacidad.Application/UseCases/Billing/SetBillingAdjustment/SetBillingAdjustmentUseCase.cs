using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Billing.SetBillingAdjustment;

/// <summary>El cuerpo del contrato: <c>BillingAdjustmentDto</c> de entrada; el id viaja en la ruta.</summary>
public sealed record SetBillingAdjustmentCommand(Guid Id, int Amount, string Reason, string? Note);

public sealed record SetBillingAdjustmentResponse(PrefactureDto Prefacture);

/// <summary>Registra o reemplaza el ajuste del período (horas extra, ingreso parcial, salida…).</summary>
public sealed class SetBillingAdjustmentUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetBillingAdjustmentCommand, SetBillingAdjustmentResponse>
{
    public async Task<SetBillingAdjustmentResponse> ExecuteAsync(
        SetBillingAdjustmentCommand request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        try
        {
            AdjustmentReason reason = AdjustmentReason.From(request.Reason);
            var adjustment = new BillingAdjustment(request.Amount, reason, request.Note);
            prefacture.SetAdjustment(adjustment);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        prefactureRepository.Update(prefacture);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        return new SetBillingAdjustmentResponse(context.ToDto(prefacture));
    }
}
