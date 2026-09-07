using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Billing;

/// <summary>Una persona externa vigente, tal como está hoy — no lo que quedó congelado en una prefactura ya generada.</summary>
public sealed record ExternalPersonSnapshot(
    Guid PersonId,
    string PersonName,
    string Position,
    string? SquadName,
    Guid ProviderId,
    decimal MonthlyCost);

/// <summary>
/// Lo que hace falta para responder una prefactura y que la prefactura sola
/// no sabe: quiénes son hoy las personas externas (para generar y para las
/// filas <c>None</c>), el nombre vigente de cada proveedor, y las ausencias
/// del chapter para derivar el descuento sin repetir la consulta una vez por
/// persona.
///
/// Se construye una vez por request, como <c>AbsenceContext</c> e
/// <c>InitiativeContext</c>.
/// </summary>
public sealed class BillingContext
{
    private readonly IReadOnlyList<ExternalPersonSnapshot> _externals;
    private readonly IReadOnlyDictionary<Guid, string> _providerNameById;
    private readonly IReadOnlyList<Absence> _absences;

    private BillingContext(
        IReadOnlyList<ExternalPersonSnapshot> externals,
        IReadOnlyDictionary<Guid, string> providerNameById,
        IReadOnlyList<Absence> absences)
    {
        _externals = externals;
        _providerNameById = providerNameById;
        _absences = absences;
    }

    public static async Task<BillingContext> BuildAsync(
        IPersonRepository people,
        ICompanyRepository companies,
        IAllocationRepository allocations,
        ISquadRepository squads,
        IAbsenceRepository absences,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Person> allPeople = await people.GetAllAsync(cancellationToken);
        IReadOnlyList<Company> allCompanies = await companies.GetAllAsync(cancellationToken);
        IReadOnlyList<Allocation> allAllocations = await allocations.GetAllAsync(cancellationToken);
        IReadOnlyList<Squad> allSquads = await squads.GetAllAsync(cancellationToken);
        IReadOnlyList<Absence> allAbsences = await absences.GetAllAsync(cancellationToken);

        Dictionary<Guid, string> squadNameById = allSquads.ToDictionary(s => s.Id, s => s.Name);

        // Una persona tiene a lo sumo una asignación vigente.
        Dictionary<Guid, string> squadNameByPerson = allAllocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(
                g => g.Key,
                g => squadNameById.GetValueOrDefault(g.First().SquadId, string.Empty));

        List<ExternalPersonSnapshot> externals =
        [
            .. allPeople
                .Where(p => p.ProviderId is not null)
                .Select(p => new ExternalPersonSnapshot(
                    p.Id,
                    p.Name,
                    p.Position,
                    squadNameByPerson.GetValueOrDefault(p.Id),
                    p.ProviderId!.Value,
                    p.MonthlyCost)),
        ];

        return new BillingContext(
            externals,
            allCompanies.ToDictionary(c => c.Id, c => c.Name),
            allAbsences);
    }

    public IReadOnlyList<ExternalPersonSnapshot> Externals => _externals;

    public AbsenceDiscount? DiscountFor(Guid personId, string period, decimal monthlyCost) =>
        BillingDiscountCalculator.Calculate(_absences, personId, period, monthlyCost);

    /// <summary>Una prefactura ya generada: snapshot congelado + proveedor y descuento resueltos ahora.</summary>
    public PrefactureDto ToDto(Prefacture prefacture)
    {
        AbsenceDiscount? discount = prefacture.Status == BillingStatus.Approved
            ? prefacture.FrozenDiscount
            : DiscountFor(prefacture.PersonId, prefacture.Period, prefacture.MonthlyCost);

        decimal expected = prefacture.MonthlyCost - (discount?.Amount ?? 0) + (prefacture.Adjustment?.Amount ?? 0);

        return new PrefactureDto(
            prefacture.Id,
            prefacture.PersonId,
            prefacture.PersonName,
            prefacture.Position,
            prefacture.SquadName,
            prefacture.ProviderId,
            _providerNameById.GetValueOrDefault(prefacture.ProviderId, string.Empty),
            prefacture.Period,
            prefacture.Status.Value,
            prefacture.MonthlyCost,
            ToDto(discount),
            ToDto(prefacture.Adjustment),
            expected,
            ToDto(prefacture.Document),
            prefacture.Prefactured,
            prefacture.Prefactured is null ? null : prefacture.Prefactured.Value - expected,
            ToDto(prefacture.Objection),
            prefacture.ApprovalNote,
            prefacture.CreatedAtUtc,
            prefacture.ApprovedAtUtc);
    }

    /// <summary>
    /// Una persona externa sin registro ese período: fila sintética, nunca
    /// persistida, con el snapshot vigente de hoy (no hay nada congelado
    /// todavía) y el descuento igual derivado en vivo.
    /// </summary>
    public PrefactureDto ToNoneDto(ExternalPersonSnapshot external, string period, DateTime now)
    {
        AbsenceDiscount? discount = DiscountFor(external.PersonId, period, external.MonthlyCost);
        decimal expected = external.MonthlyCost - (discount?.Amount ?? 0);

        return new PrefactureDto(
            Guid.Empty,
            external.PersonId,
            external.PersonName,
            external.Position,
            external.SquadName,
            external.ProviderId,
            _providerNameById.GetValueOrDefault(external.ProviderId, string.Empty),
            period,
            "None",
            external.MonthlyCost,
            ToDto(discount),
            null,
            expected,
            null,
            null,
            null,
            null,
            null,
            now,
            null);
    }

    private static AbsenceDiscountDto? ToDto(AbsenceDiscount? discount) =>
        discount is null ? null : new AbsenceDiscountDto(discount.BusinessDays, discount.Amount);

    private static BillingAdjustmentDto? ToDto(BillingAdjustment? adjustment) =>
        adjustment is null ? null : new BillingAdjustmentDto(adjustment.Amount, adjustment.Reason.Value, adjustment.Note);

    private static PrefactureDocumentDto? ToDto(PrefactureDocument? document) =>
        document is null
            ? null
            : new PrefactureDocumentDto(
                document.Number,
                document.ReceivedAt,
                document.Amount,
                document.Currency.Value,
                ToDto(document.Imputation));

    private static ImputationDto ToDto(Imputation imputation) => new(
        imputation.CostObject,
        imputation.Concept,
        imputation.AccountName,
        imputation.AccountNumber,
        imputation.CostCenter,
        imputation.PurchaseOrder,
        imputation.PaymentAccount);

    private static ObjectionDto? ToDto(Objection? objection) =>
        objection is null ? null : new ObjectionDto(objection.Reason, objection.ObjectedAtUtc);
}
