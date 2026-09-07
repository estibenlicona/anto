using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Billing.GetPrefactures;

public sealed record GetPrefacturesRequest(string? Period);

public sealed record GetPrefacturesResponse(IReadOnlyList<PrefactureDto> Items);

/// <summary>
/// Una fila por persona externa del período: la que ya tiene registro, y la
/// que todavía no, sintética en <c>None</c> y sin persistir.
/// </summary>
public sealed class GetPrefacturesUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    TimeProvider timeProvider) : IUseCase<GetPrefacturesRequest, GetPrefacturesResponse>
{
    public async Task<GetPrefacturesResponse> ExecuteAsync(
        GetPrefacturesRequest request,
        CancellationToken cancellationToken = default)
    {
        if (BusinessDayMath.MonthBounds(request.Period) is null)
        {
            throw new BadRequestException("Período inválido");
        }

        string period = request.Period!;

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        IReadOnlyList<Prefacture> existing = await prefactureRepository.GetByPeriodAsync(period, cancellationToken);
        Dictionary<Guid, Prefacture> existingByPerson = existing.ToDictionary(p => p.PersonId);

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        List<PrefactureDto> items =
        [
            .. context.Externals.Select(external => existingByPerson.TryGetValue(external.PersonId, out Prefacture? found)
                ? context.ToDto(found)
                : context.ToNoneDto(external, period, now)),
        ];

        return new GetPrefacturesResponse(items);
    }
}
