using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Billing.SetPrefacturedAmount;

public sealed record SetPrefacturedAmountRequest(Guid Id, decimal Prefactured);

public sealed record SetPrefacturedAmountResponse(PrefactureDto Prefacture);

/// <summary>Registra el valor prefacturado; el servidor calcula la diferencia al responder.</summary>
public sealed class SetPrefacturedAmountUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetPrefacturedAmountRequest, SetPrefacturedAmountResponse>
{
    public async Task<SetPrefacturedAmountResponse> ExecuteAsync(
        SetPrefacturedAmountRequest request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        try
        {
            prefacture.SetPrefactured(request.Prefactured);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        prefactureRepository.Update(prefacture);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        return new SetPrefacturedAmountResponse(context.ToDto(prefacture));
    }
}
