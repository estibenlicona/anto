using System.Text.Json;
using GestionCapacidad.Application.Absences;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Absences.CreateAbsence;
using GestionCapacidad.Application.UseCases.Absences.GetAbsencesByMonth;
using GestionCapacidad.Application.UseCases.Absences.UpdateAbsenceStatus;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AbsenceUseCaseTests
{
    private readonly Mock<IAbsenceRepository> _absences = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ICompanyRepository> _companies = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    // Octubre de 2026: 22 días hábiles. El 5 es lunes y el 7 miércoles.
    private const string October = "2026-10";
    private static readonly DateOnly Monday5 = new(2026, 10, 5);
    private static readonly DateOnly Wednesday7 = new(2026, 10, 7);

    private readonly Person _maria = TestDataFactory.CreatePerson(name: "María González");
    private readonly Squad _backend = TestDataFactory.CreateSquad(name: "Backend Platform");
    private readonly Squad _canales = TestDataFactory.CreateSquad(name: "Canales Digitales");

    public AbsenceUseCaseTests()
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(() => new[] { _maria });
        _people.Setup(r => r.GetByIdAsync(_maria.Id, It.IsAny<CancellationToken>())).ReturnsAsync(() => _maria);
        _companies.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Company>());
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new[] { _backend, _canales });
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _absences.Setup(r => r.GetByPersonAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Absence>());
    }

    private Absence Absence(
        DateOnly? start = null,
        DateOnly? end = null,
        AbsenceType? type = null,
        bool halfDay = false) =>
        new(_maria.Id, type ?? AbsenceType.Vacation, start ?? Monday5, end ?? Wednesday7, halfDay, halfDay);

    private void HaveAbsences(params Absence[] absences)
    {
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(absences);
        _absences.Setup(r => r.GetByPersonAsync(_maria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([.. absences.Where(a => a.PersonId == _maria.Id)]);
        foreach (Absence absence in absences)
        {
            _absences.Setup(r => r.GetByIdAsync(absence.Id, It.IsAny<CancellationToken>())).ReturnsAsync(absence);
        }
    }

    private void HaveAllocation(Squad squad, int dedication, int bau)
    {
        List<Allocation> current =
        [
            .. _allocations.Object.GetAllAsync().GetAwaiter().GetResult(),
            new Allocation(_maria.Id, squad.Id, null,
                Percentage.From(dedication), Percentage.From(bau), Percentage.From(dedication - bau)),
        ];
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(current);
    }

    // ── Listado del mes ───────────────────────────────────────────────────────

    private GetAbsencesByMonthUseCase Listing() =>
        new(_absences.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("2026-13")]
    [InlineData("octubre")]
    public async Task GetByMonth_WithAnInvalidMonth_IsRejected(string? month)
    {
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Listing().ExecuteAsync(new GetAbsencesByMonthRequest(month)));

        Assert.Equal("Mes inválido: se espera month=YYYY-MM", exception.Message);
    }

    [Fact]
    public async Task GetByMonth_ReportsTheBusinessDaysOfTheMonth()
    {
        HaveAbsences();

        AbsencesMonthDto month = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October))).Month;

        Assert.Equal(October, month.Month);
        Assert.Equal(22m, month.MonthBusinessDays);
        Assert.Empty(month.Items);
    }

    [Fact]
    public async Task GetByMonth_LeavesOutTheAbsencesOfOtherMonths()
    {
        HaveAbsences(Absence(new DateOnly(2026, 11, 3), new DateOnly(2026, 11, 5)));

        AbsencesMonthDto month = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October))).Month;

        Assert.Empty(month.Items);
    }

    [Fact]
    public async Task GetByMonth_IncludesAnAbsenceThatOnlyTouchesTheMonth_CountingOnlyItsDaysInside()
    {
        // Del 29 de octubre al 3 de noviembre: en octubre caen el 29 y el 30.
        HaveAbsences(Absence(new DateOnly(2026, 10, 29), new DateOnly(2026, 11, 3)));

        AbsencesMonthDto month = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October))).Month;

        AbsenceDto only = Assert.Single(month.Items);
        Assert.Equal(4m, only.BusinessDays);
        Assert.Equal(2m, only.BusinessDaysInMonth);
    }

    [Fact]
    public async Task GetByMonth_OrdersByStartDate()
    {
        HaveAbsences(
            Absence(new DateOnly(2026, 10, 20), new DateOnly(2026, 10, 21)),
            Absence(Monday5, Wednesday7));

        AbsencesMonthDto month = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October))).Month;

        Assert.Equal([Monday5, new DateOnly(2026, 10, 20)], month.Items.Select(i => i.StartDate));
    }

    // ── Derivados ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByMonth_SplitsTheImpactAcrossTheSquadsInProportionToDedication()
    {
        // 3 días hábiles de 22, con 1.0 FTE: 3/22 = 0.13636…, repartido 60/40.
        HaveAllocation(_backend, dedication: 60, bau: 30);
        HaveAllocation(_canales, dedication: 40, bau: 20);
        HaveAbsences(Absence(Monday5, Wednesday7));

        AbsenceDto absence = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October)))
            .Month.Items.Single();

        Assert.Equal(2, absence.SquadImpacts.Count);
        // La de mayor dedicación primero: es la que la fila muestra.
        Assert.Equal("Backend Platform", absence.SquadImpacts[0].SquadName);
        Assert.Equal(60, absence.SquadImpacts[0].DedicationPct);

        decimal expectedTotal = 3m / 22m;
        Assert.Equal(Math.Round(expectedTotal * 0.6m, 6), Math.Round(absence.SquadImpacts[0].FteImpact, 6));
        Assert.Equal(Math.Round(expectedTotal * 0.4m, 6), Math.Round(absence.SquadImpacts[1].FteImpact, 6));
        // Las porciones suman el impacto del mes: por eso no se redondean.
        Assert.Equal(Math.Round(expectedTotal, 6), Math.Round(absence.SquadImpacts.Sum(i => i.FteImpact), 6));
    }

    [Fact]
    public async Task GetByMonth_ForSomeoneWithoutSquads_ReportsNoImpacts()
    {
        HaveAbsences(Absence(Monday5, Wednesday7));

        AbsenceDto absence = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October)))
            .Month.Items.Single();

        Assert.Empty(absence.SquadImpacts);
    }

    [Fact]
    public async Task GetByMonth_ForSomeoneInHouse_ReportsNoProvider()
    {
        HaveAbsences(Absence());

        AbsenceDto absence = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October)))
            .Month.Items.Single();

        Assert.Null(absence.ProviderName);
        Assert.Equal("María González", absence.PersonName);
    }

    [Fact]
    public async Task GetByMonth_ForSomeoneFromAProvider_NamesIt()
    {
        var provider = new Company("GFT", "900123456", "contacto@gft.com");
        _companies.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new[] { provider });
        _maria.AssignToProvider(provider.Id);
        HaveAbsences(Absence());

        AbsenceDto absence = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October)))
            .Month.Items.Single();

        Assert.Equal("GFT", absence.ProviderName);
    }

    [Fact]
    public async Task GetByMonth_CountsAHalfDayLeaveAsHalf()
    {
        HaveAbsences(Absence(Monday5, Monday5, AbsenceType.Leave, halfDay: true));

        AbsenceDto absence = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October)))
            .Month.Items.Single();

        Assert.Equal(0.5m, absence.BusinessDays);
        Assert.Equal(0.5m, absence.BusinessDaysInMonth);
    }

    [Fact]
    public async Task AbsenceDto_SerializesWithTheContractPropertyNames()
    {
        HaveAllocation(_backend, dedication: 80, bau: 40);
        HaveAbsences(Absence());

        AbsencesMonthDto month = (await Listing().ExecuteAsync(new GetAbsencesByMonthRequest(October))).Month;
        string json = JsonSerializer.Serialize(month, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"monthBusinessDays\":22", json);
        Assert.Contains("\"businessDaysInMonth\":", json);
        Assert.Contains("\"startsHalfDay\":false", json);
        Assert.Contains("\"endsHalfDay\":false", json);
        Assert.Contains("\"providerName\":null", json);
        Assert.Contains("\"rejectReason\":null", json);
        Assert.Contains("\"squadImpacts\":", json);
        Assert.Contains("\"dedicationPct\":80", json);
        Assert.Contains("\"fteImpact\":", json);
        Assert.Contains("\"status\":\"Requested\"", json);
        Assert.Contains("\"type\":\"Vacation\"", json);
    }

    // ── Alta ──────────────────────────────────────────────────────────────────

    private CreateAbsenceUseCase Creating() =>
        new(_absences.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object,
            _unitOfWork.Object);

    private CreateAbsenceRequest NewAbsence(
        DateOnly? start = null,
        DateOnly? end = null,
        string type = "Vacation",
        bool halfDay = false,
        Guid? personId = null) =>
        new(personId ?? _maria.Id, type, start ?? Monday5, end ?? Wednesday7, halfDay, halfDay);

    [Fact]
    public async Task Create_StartsRequested()
    {
        HaveAbsences();

        AbsenceDto created = (await Creating().ExecuteAsync(NewAbsence())).Absence;

        Assert.Equal("Requested", created.Status);
        Assert.Equal(3m, created.BusinessDays);
        _absences.Verify(r => r.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Create_ForSomeoneWhoDoesNotExist_IsRejected()
    {
        HaveAbsences();
        var unknown = Guid.NewGuid();
        _people.Setup(r => r.GetByIdAsync(unknown, It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(personId: unknown)));

        Assert.Equal("La persona no existe", exception.Message);
    }

    [Fact]
    public async Task Create_WithAnInvalidRange_IsRejected()
    {
        HaveAbsences();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(start: Wednesday7, end: Monday5)));

        Assert.Equal("El rango de fechas es inválido", exception.Message);
    }

    [Fact]
    public async Task Create_WithAnUnknownType_IsRejected()
    {
        HaveAbsences();

        await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(type: "Holiday")));
    }

    [Fact]
    public async Task Create_AHalfDayVacation_IsRejected()
    {
        HaveAbsences();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(start: Monday5, end: Monday5, halfDay: true)));

        Assert.Equal("Sólo un permiso puede pedirse por medio día", exception.Message);
    }

    [Fact]
    public async Task Create_AHalfDayOverSeveralDays_IsRejected()
    {
        HaveAbsences();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(type: "Leave", halfDay: true)));

        Assert.Equal("Un medio día se pide sobre un solo día", exception.Message);
    }

    [Fact]
    public async Task Create_OverAWeekend_IsRejected()
    {
        HaveAbsences();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Creating().ExecuteAsync(
            NewAbsence(type: "Leave", start: new DateOnly(2026, 10, 10), end: new DateOnly(2026, 10, 10))));

        Assert.Equal("El rango no tiene días hábiles", exception.Message);
    }

    [Fact]
    public async Task Create_OverlappingARequestedOne_IsRejected()
    {
        HaveAbsences(Absence(Monday5, Wednesday7));

        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(start: Wednesday7, end: new DateOnly(2026, 10, 9))));

        Assert.Equal("La persona ya tiene una ausencia que se cruza con ese rango", exception.Message);
    }

    [Fact]
    public async Task Create_OverlappingAnApprovedOne_IsRejected()
    {
        Absence approved = Absence(Monday5, Wednesday7);
        approved.Approve();
        HaveAbsences(approved);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            Creating().ExecuteAsync(NewAbsence(start: Monday5, end: Monday5)));
    }

    [Fact]
    public async Task Create_OverlappingARejectedOne_IsAllowed()
    {
        // Rechazar y volver a registrar es el camino de corrección elegido, así
        // que una rechazada no puede bloquear el mismo rango.
        Absence rejected = Absence(Monday5, Wednesday7);
        rejected.Reject("Se registró con las fechas equivocadas");
        HaveAbsences(rejected);

        AbsenceDto created = (await Creating().ExecuteAsync(NewAbsence(start: Monday5, end: Wednesday7))).Absence;

        Assert.Equal("Requested", created.Status);
    }

    [Fact]
    public async Task Create_NextToAnotherWithoutTouchingIt_IsAllowed()
    {
        HaveAbsences(Absence(Monday5, Wednesday7));

        AbsenceDto created = (await Creating().ExecuteAsync(
            NewAbsence(start: new DateOnly(2026, 10, 8), end: new DateOnly(2026, 10, 9)))).Absence;

        Assert.Equal(2m, created.BusinessDays);
    }

    // ── Decisión ──────────────────────────────────────────────────────────────

    private UpdateAbsenceStatusUseCase Deciding() =>
        new(_absences.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object,
            _unitOfWork.Object);

    [Fact]
    public async Task Decide_OnSomethingThatDoesNotExist_IsNotFound()
    {
        _absences.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Absence?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(Guid.NewGuid(), "Approved", null)));
    }

    [Fact]
    public async Task Approve_ARequestedOne_Succeeds()
    {
        Absence absence = Absence();
        HaveAbsences(absence);

        AbsenceDto updated = (await Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, "Approved", null))).Absence;

        Assert.Equal("Approved", updated.Status);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Approve_AnAlreadyApprovedOne_IsRejected()
    {
        Absence absence = Absence();
        absence.Approve();
        HaveAbsences(absence);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, "Approved", null)));

        Assert.Equal("Sólo una ausencia solicitada puede aprobarse", exception.Message);
    }

    [Fact]
    public async Task Reject_WithoutReason_IsRejected()
    {
        Absence absence = Absence();
        HaveAbsences(absence);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, "Rejected", null)));

        Assert.Equal("El motivo del rechazo es obligatorio", exception.Message);
    }

    [Fact]
    public async Task Reject_AnApprovedOne_RevertsItAndTracesTheReason()
    {
        Absence absence = Absence();
        absence.Approve();
        HaveAbsences(absence);

        AbsenceDto updated = (await Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, "Rejected", "Se aprobó por error"))).Absence;

        Assert.Equal("Rejected", updated.Status);
        Assert.Equal("Se aprobó por error", updated.RejectReason);
    }

    [Fact]
    public async Task Decide_OnARejectedOne_IsRejected()
    {
        Absence absence = Absence();
        absence.Reject("No alcanza la capacidad");
        HaveAbsences(absence);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, "Approved", null)));

        Assert.Equal("Una ausencia rechazada no cambia de estado", exception.Message);
    }

    [Theory]
    [InlineData("Requested")]
    [InlineData("Pending")]
    [InlineData("")]
    public async Task Decide_WithAStatusThatIsNotADecision_IsRejected(string status)
    {
        Absence absence = Absence();
        HaveAbsences(absence);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Deciding().ExecuteAsync(
            new UpdateAbsenceStatusRequest(absence.Id, status, null)));

        Assert.Equal("Estado inválido", exception.Message);
    }
}
