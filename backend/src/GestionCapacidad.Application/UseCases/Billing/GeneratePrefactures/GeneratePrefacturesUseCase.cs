using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Billing.GeneratePrefactures;

public sealed record GeneratePrefacturesResponse(IReadOnlyList<PrefactureDto> Created);

/// <summary>
/// Genera las prefacturas del período: idempotente, sólo crea para las
/// personas externas que aún no tienen registro ese período, congelando su
/// snapshot vigente.
/// </summary>
public sealed class GeneratePrefacturesUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork) : IUseCase<GeneratePrefacturesRequest, GeneratePrefacturesResponse>
{
    public async Task<GeneratePrefacturesResponse> ExecuteAsync(
        GeneratePrefacturesRequest request,
        CancellationToken cancellationToken = default)
    {
        if (BusinessDayMath.MonthBounds(request.Period) is null)
        {
            throw new BadRequestException("Período inválido");
        }

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        IReadOnlyList<Prefacture> existing = await prefactureRepository.GetByPeriodAsync(request.Period, cancellationToken);
        HashSet<Guid> alreadyRegistered = [.. existing.Select(p => p.PersonId)];

        List<Prefacture> created =
        [
            .. context.Externals
                .Where(e => !alreadyRegistered.Contains(e.PersonId))
                .Select(e => new Prefacture(
                    e.PersonId, e.PersonName, e.Position, e.SquadName, e.ProviderId, e.MonthlyCost, request.Period)),
        ];

        foreach (Prefacture prefacture in created)
        {
            await prefactureRepository.AddAsync(prefacture, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GeneratePrefacturesResponse([.. created.Select(context.ToDto)]);
    }
}
