using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Billing.GetPrefactureById;

public sealed record GetPrefactureByIdRequest(Guid Id);

public sealed record GetPrefactureByIdResponse(PrefactureDto Prefacture);

public sealed class GetPrefactureByIdUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository) : IUseCase<GetPrefactureByIdRequest, GetPrefactureByIdResponse>
{
    public async Task<GetPrefactureByIdResponse> ExecuteAsync(
        GetPrefactureByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        return new GetPrefactureByIdResponse(context.ToDto(prefacture));
    }
}
