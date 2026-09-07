using FluentValidation;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativesStats;
using GestionCapacidad.Application.UseCases.Initiatives.SaveEvaluation;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Catalogs;
using Microsoft.Extensions.Time.Testing;
using Moq;
using GestionCapacidad.WebApi.Tests.SharedKernel;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class InitiativeUseCaseTests
{
    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IEvaluationModelProvider> _modelProvider = new();

    private static readonly DateTime Now = new(2026, 9, 5, 12, 0, 0, DateTimeKind.Utc);

    private readonly Squad _backend = TestDataFactory.CreateSquad(name: "Backend Platform");
    private readonly Squad _canales = TestDataFactory.CreateSquad(name: "Canales Digitales");

    public InitiativeUseCaseTests()
    {
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new[] { _backend, _canales });
        _squads.Setup(r => r.GetByIdAsync(_backend.Id, It.IsAny<CancellationToken>())).ReturnsAsync(() => _backend);
        _squads.Setup(r => r.GetByIdAsync(_canales.Id, It.IsAny<CancellationToken>())).ReturnsAsync(() => _canales);
        _modelProvider.Setup(p => p.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(ReferenceModel);
    }

    /// <summary>El modelo por defecto, compuesto por el proveedor real.</summary>
    private static EvaluationModelDto ReferenceModel
    {
        get
        {
            var pools = new Mock<ISingleDocumentRepository<QuestionPool>>();
            var bands = new Mock<ISingleDocumentRepository<TallaBandSet>>();
            var mixes = new Mock<ISingleDocumentRepository<CapabilityMix>>();
            pools.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((QuestionPool?)null);
            bands.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((TallaBandSet?)null);
            mixes.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((CapabilityMix?)null);

            return new EvaluationModelProvider(pools.Object, bands.Object, mixes.Object)
                .GetAsync().GetAwaiter().GetResult();
        }
    }

    private void HaveInitiatives(params Initiative[] initiatives) =>
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(initiatives);

    private void HaveInitiative(Initiative initiative)
    {
        _initiatives.Setup(r => r.GetByIdAsync(initiative.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(initiative);
    }

    /// <summary>
    /// Una iniciativa ya evaluada. El snapshot se calcula con el motor real y
    /// no a mano: uno escrito a mano podría declarar una talla que sus propias
    /// respuestas no producen, y entonces el test de "re-evaluar el plazo no
    /// cambia la talla" pasaría o fallaría por la fixture, no por el código.
    ///
    /// Respondiendo todo en 2 salen 140 puntos sobre 280 — 50 %, talla M;
    /// respondiendo todo en 1, 25 % y talla S.
    /// </summary>
    private Initiative Evaluated(Squad squad, string name, int months = 6, string talla = "M", bool active = false)
    {
        int answer = talla switch
        {
            "S" => 1,
            "M" => 2,
            "L" => 3,
            _ => throw new ArgumentOutOfRangeException(nameof(talla), talla, "Perfil no previsto en los tests."),
        };

        var initiative = new Initiative(name, squad.Id, "Paola Henao", months);
        initiative.SaveEvaluation(EvaluationEngine.Evaluate(
            ReferenceModel,
            new EvaluationInput([true, false, false, false, false, false], AllAnswers(answer), months),
            Now));

        Assert.Equal(talla, initiative.Evaluation!.Talla);

        if (active)
        {
            initiative.ChangeStatus(InitiativeStatus.Active);
        }

        return initiative;
    }

    // ── Listado y filtros ─────────────────────────────────────────────────────

    private GetInitiativesUseCase Listing() => new(_initiatives.Object, _squads.Object);

    [Fact]
    public async Task GetInitiatives_ResolvesSquadNameAndPagesTheResult()
    {
        HaveInitiatives(
            new Initiative("Kafka Migration", _backend.Id, "Paola", 6),
            new Initiative("Onboarding App", _canales.Id, "Diego", 4));

        PagedResult<InitiativeDto> page =
            (await Listing().ExecuteAsync(new GetInitiativesRequest(1, 10))).Initiatives;

        Assert.Equal(2, page.TotalCount);
        Assert.Contains(page.Items, i => i.SquadName == "Backend Platform");
        Assert.Contains(page.Items, i => i.SquadName == "Canales Digitales");
    }

    [Fact]
    public async Task GetInitiatives_FiltersByNameCaseInsensitively()
    {
        HaveInitiatives(
            new Initiative("Kafka Migration", _backend.Id, "Paola", 6),
            new Initiative("Onboarding App", _canales.Id, "Diego", 4));

        PagedResult<InitiativeDto> page =
            (await Listing().ExecuteAsync(new GetInitiativesRequest(1, 10, Search: "kafka"))).Initiatives;

        InitiativeDto only = Assert.Single(page.Items);
        Assert.Equal("Kafka Migration", only.Name);
    }

    [Fact]
    public async Task GetInitiatives_FiltersByStatus()
    {
        HaveInitiatives(
            Evaluated(_backend, "Kafka Migration", active: true),
            new Initiative("Pago con QR", _canales.Id, "Diego", 6));

        PagedResult<InitiativeDto> page = (await Listing().ExecuteAsync(
            new GetInitiativesRequest(1, 10, Statuses: ["Active"]))).Initiatives;

        InitiativeDto only = Assert.Single(page.Items);
        Assert.Equal("Kafka Migration", only.Name);
    }

    [Fact]
    public async Task GetInitiatives_FiltersBySquad()
    {
        HaveInitiatives(
            new Initiative("Kafka Migration", _backend.Id, "Paola", 6),
            new Initiative("Onboarding App", _canales.Id, "Diego", 4));

        PagedResult<InitiativeDto> page = (await Listing().ExecuteAsync(
            new GetInitiativesRequest(1, 10, SquadIds: [_canales.Id]))).Initiatives;

        InitiativeDto only = Assert.Single(page.Items);
        Assert.Equal("Onboarding App", only.Name);
    }

    [Fact]
    public async Task GetInitiatives_FilteredByTalla_LeavesOutTheUnevaluatedOnes()
    {
        HaveInitiatives(
            Evaluated(_backend, "Kafka Migration", talla: "M"),
            Evaluated(_canales, "Onboarding App", talla: "S"),
            new Initiative("Pago con QR", _canales.Id, "Diego", 6));

        PagedResult<InitiativeDto> page = (await Listing().ExecuteAsync(
            new GetInitiativesRequest(1, 10, Tallas: ["M"]))).Initiatives;

        InitiativeDto only = Assert.Single(page.Items);
        Assert.Equal("Kafka Migration", only.Name);
    }

    [Fact]
    public async Task GetInitiatives_MarksTheOnesWhoseSquadAlreadyHasAnActive()
    {
        Initiative active = Evaluated(_backend, "Kafka Migration", active: true);
        Initiative waiting = Evaluated(_backend, "Payment Engine v2");
        Initiative elsewhere = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiatives(active, waiting, elsewhere);

        PagedResult<InitiativeDto> page =
            (await Listing().ExecuteAsync(new GetInitiativesRequest(1, 10))).Initiatives;

        Assert.True(page.Items.Single(i => i.Name == "Payment Engine v2").SquadHasOtherActive);
        Assert.False(page.Items.Single(i => i.Name == "Pago con QR").SquadHasOtherActive);
        // La activa se excluye a sí misma: si no, no podría reactivarse.
        Assert.False(page.Items.Single(i => i.Name == "Kafka Migration").SquadHasOtherActive);
    }

    // ── Alta y edición ────────────────────────────────────────────────────────

    private CreateInitiativeUseCase Creating() =>
        new(_initiatives.Object, _squads.Object, _unitOfWork.Object, new CreateInitiativeValidator());

    [Fact]
    public async Task CreateInitiative_StartsEvaluatingAndUnevaluated()
    {
        HaveInitiatives();

        InitiativeDto created = (await Creating().ExecuteAsync(
            new CreateInitiativeRequest("Pago con QR", _canales.Id, "Diego Cardona", 6))).Initiative;

        Assert.Equal("Evaluating", created.Status);
        Assert.Null(created.Evaluation);
        Assert.Equal("Canales Digitales", created.SquadName);
        _initiatives.Verify(r => r.AddAsync(It.IsAny<Initiative>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateInitiative_WithUnknownSquad_IsNotFound()
    {
        HaveInitiatives();
        var unknown = Guid.NewGuid();
        _squads.Setup(r => r.GetByIdAsync(unknown, It.IsAny<CancellationToken>())).ReturnsAsync((Squad?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => Creating().ExecuteAsync(
            new CreateInitiativeRequest("Pago con QR", unknown, "Diego", 6)));
    }

    [Fact]
    public async Task CreateInitiative_WithTargetMonthsOutOfRange_IsRejected()
    {
        HaveInitiatives();

        await Assert.ThrowsAsync<DomainValidationException>(() => Creating().ExecuteAsync(
            new CreateInitiativeRequest("Pago con QR", _canales.Id, "Diego", 40)));
    }

    private UpdateInitiativeUseCase Updating() =>
        new(_initiatives.Object, _squads.Object, _modelProvider.Object, _unitOfWork.Object,
            new UpdateInitiativeValidator());

    [Fact]
    public async Task UpdateInitiative_ChangingTheTerm_RecomputesFteButKeepsTallaAndPoints()
    {
        Initiative initiative = Evaluated(_backend, "Kafka Migration", months: 6);
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        InitiativeDto updated = (await Updating().ExecuteAsync(new UpdateInitiativeRequest(
            initiative.Id, "Kafka Migration", _backend.Id, "Paola Henao", 12))).Initiative;

        Assert.NotNull(updated.Evaluation);
        Assert.Equal(12, updated.Evaluation.TargetMonths);
        // La talla no se mueve porque nadie respondió distinto; el FTE sí.
        Assert.Equal("M", updated.Evaluation.Talla);
        Assert.Equal(0.375m, updated.Evaluation.FteExpected);
        // La fecha de guardado se conserva: no es una evaluación nueva.
        Assert.Equal(Now, updated.Evaluation.SavedAtUtc);
    }

    [Fact]
    public async Task UpdateInitiative_WithoutChangingTheTerm_LeavesTheEvaluationUntouched()
    {
        Initiative initiative = Evaluated(_backend, "Kafka Migration", months: 6);
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        InitiativeDto updated = (await Updating().ExecuteAsync(new UpdateInitiativeRequest(
            initiative.Id, "Kafka Migration v2", _backend.Id, "Ana Restrepo", 6))).Initiative;

        Assert.Equal(0.75m, updated.Evaluation!.FteExpected);
        _modelProvider.Verify(p => p.GetAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateInitiative_WhenUnknown_IsNotFound()
    {
        _initiatives.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Initiative?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => Updating().ExecuteAsync(
            new UpdateInitiativeRequest(Guid.NewGuid(), "X", _backend.Id, "Paola", 6)));
    }

    // ── Guardar la evaluación ─────────────────────────────────────────────────

    private SaveEvaluationUseCase Saving() =>
        new(_initiatives.Object, _squads.Object, _modelProvider.Object, _unitOfWork.Object,
            new FakeTimeProvider(Now));

    private static Dictionary<string, int> AllAnswers(int value) =>
        ReferenceModel.Questions.ToDictionary(q => q.Id, _ => value);

    [Fact]
    public async Task SaveEvaluation_ComputesEverythingFromTheAnswers()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        InitiativeDto saved = (await Saving().ExecuteAsync(new SaveEvaluationRequest(
            initiative.Id, [true, false, false, false, false, false], AllAnswers(2), 6))).Initiative;

        Assert.NotNull(saved.Evaluation);
        Assert.Equal(140m, saved.Evaluation.Points);
        Assert.Equal(50m, saved.Evaluation.Pct);
        Assert.Equal("M", saved.Evaluation.Talla);
        Assert.Equal("Recommended", saved.Evaluation.TriageVerdict);
        Assert.Equal(Now, saved.Evaluation.SavedAtUtc);
    }

    [Fact]
    public async Task SaveEvaluation_AlsoUpdatesTheTermOfTheInitiative()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        InitiativeDto saved = (await Saving().ExecuteAsync(new SaveEvaluationRequest(
            initiative.Id, [false, false, false, false, false, false], AllAnswers(1), 9))).Initiative;

        Assert.Equal(9, saved.TargetMonths);
        Assert.Equal(9, saved.Evaluation!.TargetMonths);
    }

    [Fact]
    public async Task SaveEvaluation_WhenUnknown_IsNotFound()
    {
        _initiatives.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Initiative?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => Saving().ExecuteAsync(
            new SaveEvaluationRequest(Guid.NewGuid(), [false, false, false, false, false, false],
                new Dictionary<string, int>(), 6)));
    }

    [Fact]
    public async Task SaveEvaluation_WithAnIncompleteTriage_IsRejected()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Saving().ExecuteAsync(
            new SaveEvaluationRequest(initiative.Id, [true, false], new Dictionary<string, int>(), 6)));

        Assert.Contains("6 respuestas", exception.Message);
    }

    [Fact]
    public async Task SaveEvaluation_WithAnUnknownQuestion_IsRejected()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Saving().ExecuteAsync(
            new SaveEvaluationRequest(initiative.Id, [false, false, false, false, false, false],
                new Dictionary<string, int> { ["ZZ9"] = 2 }, 6)));

        Assert.Contains("ZZ9", exception.Message);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(5)]
    public async Task SaveEvaluation_WithAnAnswerOutOfTheScale_IsRejected(int value)
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Saving().ExecuteAsync(
            new SaveEvaluationRequest(initiative.Id, [false, false, false, false, false, false],
                new Dictionary<string, int> { ["N1"] = value }, 6)));

        Assert.Contains("N1", exception.Message);
    }

    [Fact]
    public async Task SaveEvaluation_WithAnInvalidTerm_IsRejected()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);

        await Assert.ThrowsAsync<BadRequestException>(() => Saving().ExecuteAsync(
            new SaveEvaluationRequest(initiative.Id, [false, false, false, false, false, false],
                new Dictionary<string, int>(), 0)));
    }

    // ── Cambio de estado ──────────────────────────────────────────────────────

    private ChangeInitiativeStatusUseCase ChangingStatus() =>
        new(_initiatives.Object, _squads.Object, _unitOfWork.Object);

    [Fact]
    public async Task ChangeStatus_WithAnUnknownStatus_IsRejected()
    {
        Initiative initiative = Evaluated(_backend, "Kafka Migration");
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(initiative.Id, "Paused")));

        Assert.Equal("Estado inválido", exception.Message);
    }

    [Fact]
    public async Task ChangeStatus_ActivatingWithoutEvaluation_IsRejected()
    {
        Initiative initiative = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(initiative.Id, "Active")));

        Assert.Equal("Para activar una iniciativa primero hay que evaluarla", exception.Message);
    }

    [Fact]
    public async Task ChangeStatus_ActivatingSomethingUnevaluatedInABusySquad_AsksToEvaluateFirst()
    {
        // Ambas reglas se incumplen; la que se cuenta es la que el usuario
        // puede resolver ahora, y es el orden que la pantalla ya practica.
        Initiative active = Evaluated(_canales, "Onboarding App", active: true);
        Initiative fresh = new("Pago con QR", _canales.Id, "Diego", 6);
        HaveInitiative(fresh);
        HaveInitiatives(active, fresh);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(fresh.Id, "Active")));

        Assert.Equal("Para activar una iniciativa primero hay que evaluarla", exception.Message);
    }

    [Fact]
    public async Task ChangeStatus_ActivatingWhenTheSquadAlreadyHasOne_IsRejected()
    {
        Initiative active = Evaluated(_backend, "Kafka Migration", active: true);
        Initiative waiting = Evaluated(_backend, "Payment Engine v2");
        HaveInitiative(waiting);
        HaveInitiatives(active, waiting);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(waiting.Id, "Active")));

        Assert.Equal(
            "La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.",
            exception.Message);
    }

    [Fact]
    public async Task ChangeStatus_ClosingSomethingThatIsNotActive_IsRejected()
    {
        Initiative initiative = Evaluated(_backend, "Payment Engine v2");
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(initiative.Id, "Closed")));

        Assert.Equal("Sólo se cierra una iniciativa activa", exception.Message);
    }

    [Fact]
    public async Task ChangeStatus_ActivatingAnEvaluatedOneInAFreeSquad_Succeeds()
    {
        Initiative initiative = Evaluated(_canales, "Onboarding App");
        HaveInitiative(initiative);
        HaveInitiatives(initiative);

        InitiativeDto updated = (await ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(initiative.Id, "Active"))).Initiative;

        Assert.Equal("Active", updated.Status);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeStatus_OnAnUnknownInitiative_IsNotFound()
    {
        _initiatives.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Initiative?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => ChangingStatus().ExecuteAsync(
            new ChangeInitiativeStatusRequest(Guid.NewGuid(), "Active")));
    }

    // ── Resumen ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Stats_CountsTotalsAndTheFiveTallasEvenAtZero()
    {
        HaveInitiatives(
            Evaluated(_backend, "Kafka Migration", months: 6, talla: "M", active: true),
            Evaluated(_canales, "Onboarding App", months: 4, talla: "S", active: true),
            new Initiative("Pago con QR", _canales.Id, "Diego", 6));

        InitiativesStatsDto stats =
            (await new GetInitiativesStatsUseCase(_initiatives.Object, _modelProvider.Object).ExecuteAsync()).Stats;

        Assert.Equal(3, stats.Total);
        Assert.Equal(1, stats.Unevaluated);
        Assert.Equal(2, stats.Active);
        Assert.Equal(["XS", "S", "M", "L", "XL"], stats.ActiveByTalla.Select(b => b.Talla));
        Assert.Equal([0, 1, 1, 0, 0], stats.ActiveByTalla.Select(b => b.Count));
    }

    [Fact]
    public async Task Stats_SumsTheExpectedFteOfTheActiveOnesToTwoDecimals()
    {
        HaveInitiatives(
            Evaluated(_backend, "Kafka Migration", active: true),
            Evaluated(_canales, "Onboarding App", active: true),
            Evaluated(_canales, "Payment Engine v2"));

        InitiativesStatsDto stats =
            (await new GetInitiativesStatsUseCase(_initiatives.Object, _modelProvider.Object).ExecuteAsync()).Stats;

        // Sólo las activas: 0.75 + 0.75.
        Assert.Equal(1.5m, stats.FteDemand);
    }
}
