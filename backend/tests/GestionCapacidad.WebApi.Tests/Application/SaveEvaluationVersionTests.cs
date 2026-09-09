using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Application.UseCases.Initiatives.SaveEvaluation;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Catalogs;
using GestionCapacidad.Infrastructure.Persistence;
using Microsoft.Extensions.Time.Testing;
using Moq;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// Guardar una evaluación deja escrito con qué versión se calculó, y valida las
/// respuestas contra las opciones que esa versión declara — no contra un rango
/// 0–4 cableado, que era una constante del código y no un dato del modelo.
/// </summary>
public sealed class SaveEvaluationVersionTests
{
    private static readonly DateTimeOffset Now = new(2026, 3, 1, 12, 0, 0, TimeSpan.Zero);

    private readonly Mock<IInitiativeRepository> _initiatives = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IEvaluationModelProvider> _modelProvider = new();
    private readonly Mock<IEstimationVersionProvider> _versionProvider = new();

    private readonly Squad _squad = TestDataFactory.CreateSquad(name: "Canales Digitales");
    private readonly EstimationModel _model = LegacyModelConversion.BuildInitialModel(
        ModelParameterDefaults.QuestionPool(),
        ModelParameterDefaults.TallaBands(),
        ModelParameterDefaults.CapabilityMix(),
        new DateOnly(2026, 3, 1),
        Now.UtcDateTime);

    private EvaluationModelDto Legacy { get; }

    public SaveEvaluationVersionTests()
    {
        var pools = new Mock<ISingleDocumentRepository<QuestionPool>>();
        var bands = new Mock<ISingleDocumentRepository<TallaBandSet>>();
        var mixes = new Mock<ISingleDocumentRepository<CapabilityMix>>();
        pools.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((QuestionPool?)null);
        bands.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((TallaBandSet?)null);
        mixes.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((CapabilityMix?)null);

        Legacy = new EvaluationModelProvider(pools.Object, bands.Object, mixes.Object)
            .GetAsync().GetAwaiter().GetResult();

        _modelProvider.Setup(p => p.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Legacy);
        _versionProvider
            .Setup(p => p.GetCurrentAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(_model.CurrentVersion!.ToDto(_model.Id.ToString()));

        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_squad]);
    }

    private SaveEvaluationUseCase Saving() => new(
        _initiatives.Object,
        _squads.Object,
        _modelProvider.Object,
        _versionProvider.Object,
        _unitOfWork.Object,
        new FakeTimeProvider(Now));

    private Initiative HaveInitiative()
    {
        Initiative initiative = new("Pago con QR", _squad.Id, "Diego", 6);
        _initiatives.Setup(r => r.GetByIdAsync(initiative.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(initiative);
        _initiatives.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([initiative]);
        return initiative;
    }

    private SaveEvaluationRequest Request(Initiative initiative, IReadOnlyDictionary<string, int> answers) =>
        new(initiative.Id, new bool[Legacy.Triage.Count], answers, 6);

    [Fact]
    public async Task LaEvaluacionGuardaLaVersionConLaQueSeCalculo()
    {
        Initiative initiative = HaveInitiative();
        var answers = Legacy.Questions.ToDictionary(q => q.Id, _ => 2);

        await Saving().ExecuteAsync(Request(initiative, answers));

        Assert.NotNull(initiative.Evaluation);
        Assert.Equal(_model.CurrentVersion!.Id, initiative.Evaluation.ModelVersionId);
        Assert.Equal(1, initiative.Evaluation.ModelVersionNumber);
    }

    [Fact]
    public async Task UnValorQueNoEsOpcionDeLaPreguntaSeRechazaSinTocarLaEvaluacionPrevia()
    {
        Initiative initiative = HaveInitiative();
        var valid = Legacy.Questions.ToDictionary(q => q.Id, _ => 2);
        await Saving().ExecuteAsync(Request(initiative, valid));

        InitiativeEvaluation before = initiative.Evaluation!;

        var invalid = new Dictionary<string, int>(valid) { [Legacy.Questions[0].Id] = 5 };
        BadRequestException error = await Assert.ThrowsAsync<BadRequestException>(
            () => Saving().ExecuteAsync(Request(initiative, invalid)));

        Assert.Contains("no corresponde a ninguna", error.Message);
        Assert.Contains("5 opciones", error.Message);
        Assert.Same(before, initiative.Evaluation);
    }

    [Fact]
    public async Task UnaPreguntaQueLaVersionNoTieneSeRechaza()
    {
        Initiative initiative = HaveInitiative();

        BadRequestException error = await Assert.ThrowsAsync<BadRequestException>(
            () => Saving().ExecuteAsync(Request(
                initiative,
                new Dictionary<string, int> { ["NO-EXISTE"] = 1 })));

        Assert.Contains("no está en el modelo vigente", error.Message);
        Assert.Null(initiative.Evaluation);
    }

    [Fact]
    public async Task PublicarUnaVersionNuevaNoTocaLaEvaluacionYaGuardada()
    {
        Initiative initiative = HaveInitiative();
        await Saving().ExecuteAsync(Request(
            initiative,
            Legacy.Questions.ToDictionary(q => q.Id, _ => 4)));

        InitiativeEvaluation saved = initiative.Evaluation!;
        string talla = saved.Talla;
        Guid versionId = saved.ModelVersionId;

        // Se publica una versión nueva: el proveedor pasa a servir otra cosa.
        EstimationModelDevelopmentSeeder.BringToThreeStates(_model, Now.UtcDateTime);
        _versionProvider
            .Setup(p => p.GetCurrentAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(_model.CurrentVersion!.ToDto(_model.Id.ToString()));

        Assert.Equal(2, _model.CurrentVersion!.Number);
        Assert.Equal(talla, initiative.Evaluation!.Talla);
        Assert.Equal(versionId, initiative.Evaluation.ModelVersionId);
        Assert.Equal(1, initiative.Evaluation.ModelVersionNumber);
    }
}
