using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Billing.GeneratePrefactures;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactureById;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactures;
using GestionCapacidad.Application.UseCases.Billing.RegisterPrefactureDocument;
using GestionCapacidad.Application.UseCases.Billing.RemoveBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingStatus;
using GestionCapacidad.Application.UseCases.Billing.SetPrefacturedAmount;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class BillingUseCaseTests
{
    private readonly Mock<IPrefactureRepository> _prefactures = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ICompanyRepository> _companies = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IAbsenceRepository> _absences = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));

    private const string October = "2026-10";
    private readonly Guid _providerId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private readonly Person _paula = TestDataFactory.CreatePerson(name: "Paula Ramírez", position: "Data Engineer");

    public BillingUseCaseTests()
    {
        _paula.AssignToProvider(_providerId);
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_paula]);
        _companies.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([new Company("GFT", "900123456", "contacto@gft.com")]);
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Absence>());
        _prefactures.Setup(r => r.GetByPeriodAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Prefacture>());
    }

    private Prefacture NewPrefacture(decimal monthlyCost = 6_000_000m) =>
        new(_paula.Id, _paula.Name, _paula.Position, null, _providerId, monthlyCost, October);

    private void Have(Prefacture prefacture)
    {
        _prefactures.Setup(r => r.GetByIdAsync(prefacture.Id, It.IsAny<CancellationToken>())).ReturnsAsync(prefacture);
        _prefactures.Setup(r => r.GetByPeriodAsync(prefacture.Period, It.IsAny<CancellationToken>()))
            .ReturnsAsync([prefacture]);
    }

    // ── GetPrefactures ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetPrefactures_WithInvalidPeriod_Throws()
    {
        var useCase = new GetPrefacturesUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new GetPrefacturesRequest("2026-13")));
    }

    [Fact]
    public async Task GetPrefactures_ExternalWithoutRecord_AppearsAsNone()
    {
        var useCase = new GetPrefacturesUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object, _timeProvider);

        GetPrefacturesResponse response = await useCase.ExecuteAsync(new GetPrefacturesRequest(October));

        PrefactureDto row = Assert.Single(response.Items);
        Assert.Equal("None", row.Status);
        Assert.Equal(Guid.Empty, row.Id);
    }

    [Fact]
    public async Task GetPrefactures_ExternalWithRecord_AppearsWithItsRealStatus()
    {
        Prefacture prefacture = NewPrefacture();
        Have(prefacture);
        var useCase = new GetPrefacturesUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object, _timeProvider);

        GetPrefacturesResponse response = await useCase.ExecuteAsync(new GetPrefacturesRequest(October));

        PrefactureDto row = Assert.Single(response.Items);
        Assert.Equal("Pending", row.Status);
        Assert.Equal(prefacture.Id, row.Id);
    }

    // ── GetPrefactureById ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetPrefactureById_WithUnknownId_Throws404()
    {
        var useCase = new GetPrefactureByIdUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new GetPrefactureByIdRequest(Guid.NewGuid())));
    }

    // ── GeneratePrefactures ───────────────────────────────────────────────────

    [Fact]
    public async Task GeneratePrefactures_FirstTime_CreatesForEveryExternal()
    {
        var useCase = new GeneratePrefacturesUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);

        GeneratePrefacturesResponse response = await useCase.ExecuteAsync(new GeneratePrefacturesRequest(October));

        Assert.Single(response.Created);
        Assert.Equal("Pending", response.Created[0].Status);
        _prefactures.Verify(r => r.AddAsync(It.IsAny<Prefacture>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GeneratePrefactures_SecondTime_DoesNotDuplicate()
    {
        Prefacture existing = NewPrefacture();
        _prefactures.Setup(r => r.GetByPeriodAsync(October, It.IsAny<CancellationToken>())).ReturnsAsync([existing]);
        var useCase = new GeneratePrefacturesUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);

        GeneratePrefacturesResponse response = await useCase.ExecuteAsync(new GeneratePrefacturesRequest(October));

        Assert.Empty(response.Created);
        _prefactures.Verify(r => r.AddAsync(It.IsAny<Prefacture>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ── RegisterPrefactureDocument ────────────────────────────────────────────

    private static ImputationDto BlankImputation() => new(null, null, null, null, null, null, null);

    [Fact]
    public async Task RegisterPrefactureDocument_WithInvalidData_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        Have(prefacture);
        var useCase = new RegisterPrefactureDocumentUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);
        var request = new RegisterPrefactureRequest("", new DateOnly(2026, 10, 5), 0, "COP", BlankImputation());

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new RegisterPrefactureDocumentRequest(prefacture.Id, request)));
    }

    [Fact]
    public async Task RegisterPrefactureDocument_OnObjected_ReplacesDocument_AndReturnsToReceived()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        prefacture.Object("motivo", DateTime.UtcNow);
        Have(prefacture);
        var useCase = new RegisterPrefactureDocumentUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);
        var request = new RegisterPrefactureRequest("FE-2", new DateOnly(2026, 10, 20), 5_900_000m, "COP", BlankImputation());

        RegisterPrefactureDocumentResponse response = await useCase.ExecuteAsync(
            new RegisterPrefactureDocumentRequest(prefacture.Id, request));

        Assert.Equal("Received", response.Prefacture.Status);
        Assert.Equal(5_900_000, response.Prefacture.Prefactured);
    }

    // ── SetPrefacturedAmount / SetBillingAdjustment / RemoveBillingAdjustment ─

    [Fact]
    public async Task SetPrefacturedAmount_MovesFromReceivedToInReview()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetPrefacturedAmountUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);

        var response = await useCase.ExecuteAsync(new SetPrefacturedAmountRequest(prefacture.Id, 6_100_000m));

        Assert.Equal("InReview", response.Prefacture.Status);
        Assert.Equal(6_100_000, response.Prefacture.Prefactured);
    }

    [Fact]
    public async Task SetBillingAdjustment_WithInvalidReason_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingAdjustmentUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetBillingAdjustmentCommand(prefacture.Id, 100_000, "Bonus", null)));
    }

    [Fact]
    public async Task RemoveBillingAdjustment_OnApproved_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        prefacture.Approve(null, null, DateTime.UtcNow);
        Have(prefacture);
        var useCase = new RemoveBillingAdjustmentUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new RemoveBillingAdjustmentRequest(prefacture.Id)));
    }

    // ── SetBillingStatus ──────────────────────────────────────────────────────

    [Fact]
    public async Task SetBillingStatus_ApproveWithZeroDifference_WithoutNote_Succeeds()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        var response = await useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Approved", null, null));

        Assert.Equal("Approved", response.Prefacture.Status);
    }

    [Fact]
    public async Task SetBillingStatus_ApproveWithNonZeroDifference_WithNote_Succeeds_AndFreezesTheDiscount()
    {
        var absence = new Absence(_paula.Id, AbsenceType.Vacation, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7), false, false);
        absence.Approve();
        _absences.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([absence]);

        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        var response = await useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Approved", "Se aprueba con nota", null));

        Assert.Equal("Approved", response.Prefacture.Status);
        Assert.NotNull(response.Prefacture.AbsenceDiscount);
    }

    [Fact]
    public async Task SetBillingStatus_ApproveWithNonZeroDifference_WithoutNote_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_500_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Approved", null, null)));
    }

    [Fact]
    public async Task SetBillingStatus_ObjectWithReason_Succeeds()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        var response = await useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Objected", null, "Facturaron de más"));

        Assert.Equal("Objected", response.Prefacture.Status);
    }

    [Fact]
    public async Task SetBillingStatus_ObjectWithoutReason_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Objected", null, null)));
    }

    [Fact]
    public async Task SetBillingStatus_OutsideReceivedOrInReview_Throws400()
    {
        Prefacture prefacture = NewPrefacture();
        Have(prefacture);
        var useCase = new SetBillingStatusUseCase(
            _prefactures.Object, _people.Object, _companies.Object, _allocations.Object, _squads.Object, _absences.Object,
            _unitOfWork.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetBillingStatusCommand(prefacture.Id, "Approved", null, null)));
    }
}
