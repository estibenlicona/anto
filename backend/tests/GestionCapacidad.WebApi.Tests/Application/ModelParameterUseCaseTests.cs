using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Admin.GetCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.GetQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.GetSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.GetTallaBands;
using GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using Moq;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ModelParameterUseCaseTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    // ── Lectura: sin fila responde el default, sin persistirlo ────────────────

    [Fact]
    public async Task GetSprintConfig_WithNoStoredRow_RespondsTheDefaultWithoutSaving()
    {
        var repository = new Mock<ISingleDocumentRepository<SprintConfiguration>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((SprintConfiguration?)null);

        SprintConfigDto config = (await new GetSprintConfigUseCase(repository.Object).ExecuteAsync()).Config;

        Assert.Equal(80m, config.HoursPerSprint);
        Assert.Equal("23:00", config.SprintCloseTime);
        repository.Verify(r => r.AddAsync(It.IsAny<SprintConfiguration>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GetSprintConfig_WithStoredRow_RespondsIt()
    {
        var stored = new SprintConfiguration(3, 4, 100m, "18:30", 10, 4);
        var repository = new Mock<ISingleDocumentRepository<SprintConfiguration>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(stored);

        SprintConfigDto config = (await new GetSprintConfigUseCase(repository.Object).ExecuteAsync()).Config;

        Assert.Equal(100m, config.HoursPerSprint);
        Assert.Equal(10, config.HistoryWindowSprints);
    }

    [Fact]
    public async Task GetTallaBands_WithNoStoredRow_RespondsTheDefault()
    {
        var repository = new Mock<ISingleDocumentRepository<TallaBandSet>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((TallaBandSet?)null);

        TallaBandsDto bands = (await new GetTallaBandsUseCase(repository.Object).ExecuteAsync()).Bands;

        Assert.Equal([20m, 40m, 60m, 80m], bands.Boundaries);
        Assert.Equal(["XS", "S", "M", "L", "XL"], bands.Bands.Select(b => b.Talla));
    }

    [Fact]
    public async Task GetCapabilityMix_WithNoStoredRow_RespondsTheDefault()
    {
        var repository = new Mock<ISingleDocumentRepository<CapabilityMix>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((CapabilityMix?)null);

        IReadOnlyList<CapabilityMixRowDto> rows =
            (await new GetCapabilityMixUseCase(repository.Object).ExecuteAsync()).Rows;

        Assert.Equal(["Backend Dev", "QA Engineer", "Arquitecto"], rows.Select(r => r.Capacidad));
    }

    [Fact]
    public async Task GetQuestionPool_WithNoStoredRow_RespondsTheThirtyQuestions()
    {
        var repository = new Mock<ISingleDocumentRepository<QuestionPool>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((QuestionPool?)null);

        IReadOnlyList<QuestionPoolRowDto> questions =
            (await new GetQuestionPoolUseCase(repository.Object).ExecuteAsync()).Questions;

        Assert.Equal(30, questions.Count);
        Assert.Equal("N1", questions[0].Id);
    }

    // ── Guardado: primero crea, después reemplaza ────────────────────────────

    [Fact]
    public async Task SaveSprintConfig_WithNoStoredRow_AddsAndSaves()
    {
        var repository = new Mock<ISingleDocumentRepository<SprintConfiguration>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SprintConfiguration?)null);

        var useCase = new SaveSprintConfigUseCase(repository.Object, _unitOfWork.Object, new SaveSprintConfigValidator());
        SprintConfigDto config = (await useCase.ExecuteAsync(new SaveSprintConfigRequest(3, 5, 90m, "20:00", 8, 4))).Config;

        Assert.Equal(90m, config.HoursPerSprint);
        repository.Verify(r => r.AddAsync(It.IsAny<SprintConfiguration>(), It.IsAny<CancellationToken>()), Times.Once);
        repository.Verify(r => r.Update(It.IsAny<SprintConfiguration>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SaveSprintConfig_WithStoredRow_UpdatesInsteadOfAdding()
    {
        var stored = new SprintConfiguration(2, 6, 80m, "23:00", 6, 3);
        var repository = new Mock<ISingleDocumentRepository<SprintConfiguration>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(stored);

        var useCase = new SaveSprintConfigUseCase(repository.Object, _unitOfWork.Object, new SaveSprintConfigValidator());
        await useCase.ExecuteAsync(new SaveSprintConfigRequest(2, 6, 80m, "23:00", 10, 3));

        Assert.Equal(10, stored.HistoryWindowSprints);
        repository.Verify(r => r.AddAsync(It.IsAny<SprintConfiguration>(), It.IsAny<CancellationToken>()), Times.Never);
        repository.Verify(r => r.Update(stored), Times.Once);
    }

    [Fact]
    public async Task SaveSprintConfig_WithInvalidRequest_ThrowsWithoutTouchingTheRepository()
    {
        var repository = new Mock<ISingleDocumentRepository<SprintConfiguration>>();

        var useCase = new SaveSprintConfigUseCase(repository.Object, _unitOfWork.Object, new SaveSprintConfigValidator());

        var exception = await Assert.ThrowsAsync<DomainValidationException>(() =>
            useCase.ExecuteAsync(new SaveSprintConfigRequest(2, 6, 80m, "23:00", 4, 6)));

        Assert.Contains(exception.Errors, e => e.Contains("ventana de histórico"));
        repository.Verify(r => r.GetAsync(It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SaveTallaBands_KeepsTheOrderOfTheBodyItReceived()
    {
        var repository = new Mock<ISingleDocumentRepository<TallaBandSet>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((TallaBandSet?)null);

        var useCase = new SaveTallaBandsUseCase(repository.Object, _unitOfWork.Object, new SaveTallaBandsValidator());
        TallaBandsDto bands = (await useCase.ExecuteAsync(new SaveTallaBandsRequest(
            [20m, 40m, 60m, 80m],
            [
                new TallaBandDto("XS", 0.5m, 1m, "Otra lectura"),
                new TallaBandDto("S", 1m, 3m, "Ajuste puntual"),
                new TallaBandDto("M", 3m, 6m, "Iniciativa media"),
                new TallaBandDto("L", 6m, 10m, "Iniciativa grande"),
                new TallaBandDto("XL", 10m, 18m, "Transformación mayor"),
            ]))).Bands;

        Assert.Equal(["XS", "S", "M", "L", "XL"], bands.Bands.Select(b => b.Talla));
        Assert.Equal("Otra lectura", bands.Bands[0].Lectura);
    }

    [Fact]
    public async Task SaveCapabilityMix_WithStoredRow_ReplacesItAndKeepsTheSentOrder()
    {
        var stored = new CapabilityMix(
            [new CapabilityMixRow(0, "backend-dev", "Backend Dev", new Dictionary<string, int> { ["M"] = 3 })]);
        var repository = new Mock<ISingleDocumentRepository<CapabilityMix>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(stored);

        var useCase = new SaveCapabilityMixUseCase(repository.Object, _unitOfWork.Object, new SaveCapabilityMixValidator());
        IReadOnlyList<CapabilityMixRowDto> rows = (await useCase.ExecuteAsync(new SaveCapabilityMixRequest(
        [
            new CapabilityMixRowDto("arquitecto", "Arquitecto", new Dictionary<string, int> { ["M"] = 1 }),
            new CapabilityMixRowDto("backend-dev", "Backend Dev", new Dictionary<string, int> { ["M"] = 4 }),
        ]))).Rows;

        Assert.Equal(["Arquitecto", "Backend Dev"], rows.Select(r => r.Capacidad));
        Assert.Equal(4, rows[1].PorTalla["M"]);
        repository.Verify(r => r.Update(stored), Times.Once);
    }

    [Fact]
    public async Task SaveCapabilityMix_WithRepeatedName_ThrowsWithoutSaving()
    {
        var repository = new Mock<ISingleDocumentRepository<CapabilityMix>>();

        var useCase = new SaveCapabilityMixUseCase(repository.Object, _unitOfWork.Object, new SaveCapabilityMixValidator());

        await Assert.ThrowsAsync<DomainValidationException>(() => useCase.ExecuteAsync(new SaveCapabilityMixRequest(
        [
            new CapabilityMixRowDto("qa-1", "QA Engineer", new Dictionary<string, int>()),
            new CapabilityMixRowDto("qa-2", "qa engineer", new Dictionary<string, int>()),
        ])));

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SaveQuestionPool_WithFewerQuestions_ReplacesTheWholeList()
    {
        var stored = new QuestionPool(
        [
            new PoolQuestion(0, "N1", GestionCapacidad.Domain.ValueObjects.QuestionDimension.NegocioYCliente, "¿A?", 2),
            new PoolQuestion(1, "N2", GestionCapacidad.Domain.ValueObjects.QuestionDimension.NegocioYCliente, "¿B?", 3),
        ]);
        var repository = new Mock<ISingleDocumentRepository<QuestionPool>>();
        repository.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(stored);

        var useCase = new SaveQuestionPoolUseCase(repository.Object, _unitOfWork.Object, new SaveQuestionPoolValidator());
        IReadOnlyList<QuestionPoolRowDto> questions = (await useCase.ExecuteAsync(new SaveQuestionPoolRequest(
            [new QuestionPoolRowDto("N1", "Integraciones", "¿A reformulada?", 4)]))).Questions;

        QuestionPoolRowDto only = Assert.Single(questions);
        Assert.Equal("N1", only.Id);
        Assert.Equal("Integraciones", only.Dimension);
        Assert.Equal(4, only.Peso);
    }

    [Fact]
    public async Task SaveQuestionPool_WithUnknownDimension_ThrowsWithoutSaving()
    {
        var repository = new Mock<ISingleDocumentRepository<QuestionPool>>();

        var useCase = new SaveQuestionPoolUseCase(repository.Object, _unitOfWork.Object, new SaveQuestionPoolValidator());

        await Assert.ThrowsAsync<DomainValidationException>(() => useCase.ExecuteAsync(new SaveQuestionPoolRequest(
            [new QuestionPoolRowDto("N1", "Dimensión inventada", "¿Texto?", 2)])));

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
