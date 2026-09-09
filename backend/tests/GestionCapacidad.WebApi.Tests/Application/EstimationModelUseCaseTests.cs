using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.UseCases.Admin;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.Domain;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class EstimationModelUseCaseTests
{
    private const string Author = "Estiben Licona";

    private readonly Mock<IEstimationModelRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private EstimationModel Have(EstimationModel model)
    {
        _repository
            .Setup(r => r.GetWithContentAsync(model.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(model);
        _repository
            .Setup(r => r.GetAllWithContentAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([model]);
        _repository
            .Setup(r => r.CountEstimationsByVersionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(model.Versions.ToDictionary(v => v.Id, _ => 0));
        return model;
    }

    // ── Lectura ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task LaListaTraeLasVersionesDeLaMasNuevaALaMasVieja()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithPublishedAndDraft());

        GetEstimationModelsResponse response =
            await new GetEstimationModelsUseCase(_repository.Object).ExecuteAsync();

        EstimationModelListItemDto item = Assert.Single(response.Models);
        Assert.Equal([2, 1], item.Versions.Select(v => v.Number));
        Assert.Equal("Borrador", item.Versions[0].Status);
        Assert.Equal("Vigente", item.Versions[1].Status);
        Assert.Equal("Inicial", item.Phase);
    }

    [Fact]
    public async Task LaListaDiceCuantasEstimacionesCalculoCadaVersion()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithPublishedAndDraft());
        Guid currentId = model.VersionOf(1).Id;
        _repository
            .Setup(r => r.CountEstimationsByVersionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<Guid, int> { [currentId] = 123 });

        GetEstimationModelsResponse response =
            await new GetEstimationModelsUseCase(_repository.Object).ExecuteAsync();

        EstimationModelListItemDto item = Assert.Single(response.Models);
        Assert.Equal(123, item.Versions.Single(v => v.Number == 1).EstimationsCount);
        Assert.Equal(0, item.Versions.Single(v => v.Number == 2).EstimationsCount);
    }

    [Fact]
    public async Task ElContenidoDeUnaVersionTraeTodoLoQueElMotorNecesita()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        GetModelVersionContentResponse response =
            await new GetModelVersionContentUseCase(_repository.Object)
                .ExecuteAsync(new ModelVersionQuery(model.Id, 1));

        EstimationModelVersionDto version = response.Version;
        Assert.Equal("Borrador", response.Status);
        Assert.Equal(2, version.Dimensions.Count);
        Assert.Equal(4, version.Questions.Count);
        Assert.Equal(3, version.Drivers.Count);
        Assert.Equal(5, version.TallaRules.Count);
        Assert.Single(version.MixModifiers);
    }

    [Fact]
    public async Task UnaVersionQueNoExisteResponde404()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new GetModelVersionContentUseCase(_repository.Object)
                .ExecuteAsync(new ModelVersionQuery(model.Id, 99)));
    }

    [Fact]
    public async Task LaValidacionTraeLosNueveChequeosConSuSeccion()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        GetModelVersionValidationResponse response =
            await new GetModelVersionValidationUseCase(_repository.Object)
                .ExecuteAsync(new ModelVersionQuery(model.Id, 1));

        Assert.Equal(9, response.Report.Checks.Count);
        Assert.True(response.Report.CanPublish);
        Assert.All(response.Report.Checks, c => Assert.False(string.IsNullOrWhiteSpace(c.Section)));
    }

    [Fact]
    public async Task LasDiferenciasComparanContraLaVigente()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithPublishedAndDraft());
        ModelVersion draft = model.VersionOf(2);
        draft.ReplaceRiskBands(
            [
                new ModelRiskBand(0, "Bajo", 40m),
                new ModelRiskBand(1, "Medio", 70m),
                new ModelRiskBand(2, "Alto", 100m),
            ],
            Author,
            EstimationModelBuilder.At);

        GetModelVersionDiffResponse response =
            await new GetModelVersionDiffUseCase(_repository.Object)
                .ExecuteAsync(new ModelVersionQuery(model.Id, 2));

        Assert.Equal(1, response.Diff.FromVersion);
        Assert.Equal(2, response.Diff.ToVersion);
        Assert.Contains(response.Diff.Entries, e => e.Item.Contains("Bajo") && e.Kind == "cambiado");
        Assert.All(response.Diff.Entries, e => Assert.False(string.IsNullOrWhiteSpace(e.Section)));
    }

    [Fact]
    public async Task ElHistorialVaDeLoMasNuevoALoMasViejoYSiempreTieneAutor()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        GetModelVersionHistoryResponse response =
            await new GetModelVersionHistoryUseCase(_repository.Object)
                .ExecuteAsync(new ModelVersionQuery(model.Id, 1));

        Assert.NotEmpty(response.Entries);
        Assert.All(response.Entries, e => Assert.False(string.IsNullOrWhiteSpace(e.Author)));
        Assert.Equal(
            response.Entries.OrderByDescending(e => e.OccurredAtUtc).Select(e => e.Summary),
            response.Entries.Select(e => e.Summary));
    }

    // ── Escritura ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CrearUnaVersionDejaUnBorradorConElContenidoCopiado()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());
        model.Publish(1, new DateOnly(2026, 3, 1), "Primera.", Author, [], EstimationModelBuilder.At);

        CreateModelVersionResponse response =
            await new CreateModelVersionUseCase(_repository.Object, _unitOfWork.Object)
                .ExecuteAsync(new CreateModelVersionCommand(model.Id, new CreateModelVersionRequest(Author, 1)));

        Assert.Equal(2, response.Number);
        Assert.Equal("Borrador", response.Status);
        Assert.Equal(model.VersionOf(1).Questions.Count, model.VersionOf(2).Questions.Count);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    public static TheoryData<string, Func<IEstimationModelRepository, IUnitOfWork, Guid, string, Task>> Writes() => new()
    {
        {
            "dimensiones",
            (repo, uow, id, author) => new SaveModelDimensionsUseCase(repo, uow).ExecuteAsync(
                new SaveDimensionsCommand(id, 1, new SaveDimensionsRequest(author, [], [], [])))
        },
        {
            "drivers",
            (repo, uow, id, author) => new SaveModelDriversUseCase(repo, uow).ExecuteAsync(
                new SaveDriversCommand(id, 1, new SaveDriversRequest(author, [], [])))
        },
        {
            "tallas",
            (repo, uow, id, author) => new SaveModelTallaRulesUseCase(repo, uow).ExecuteAsync(
                new SaveTallaRulesCommand(id, 1, new SaveTallaRulesRequest(author, [20m], [], [])))
        },
        {
            "mix",
            (repo, uow, id, author) => new SaveModelMixUseCase(repo, uow).ExecuteAsync(
                new SaveMixCommand(id, 1, new SaveMixRequest(author, [], [])))
        },
        {
            "publicación",
            (repo, uow, id, author) => new PublishModelVersionUseCase(repo, uow).ExecuteAsync(
                new PublishModelVersionCommand(
                    id, 1, new PublishModelVersionRequest(author, new DateOnly(2026, 6, 1), "Nota.")))
        },
    };

    [Theory]
    [MemberData(nameof(Writes))]
    public async Task UnaEscrituraSinAutorSeRechazaConBadRequest(
        string _,
        Func<IEstimationModelRepository, IUnitOfWork, Guid, string, Task> write)
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        BadRequestException error = await Assert.ThrowsAsync<BadRequestException>(
            () => write(_repository.Object, _unitOfWork.Object, model.Id, "   "));

        Assert.Contains("autor", error.Message);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [MemberData(nameof(Writes))]
    public async Task UnaEscrituraSobreUnaVersionPublicadaSeRechazaConConflicto(
        string _,
        Func<IEstimationModelRepository, IUnitOfWork, Guid, string, Task> write)
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());
        model.Publish(1, new DateOnly(2026, 3, 1), "Primera.", Author, [], EstimationModelBuilder.At);
        int questions = model.VersionOf(1).Questions.Count;

        ConflictException error = await Assert.ThrowsAsync<ConflictException>(
            () => write(_repository.Object, _unitOfWork.Object, model.Id, Author));

        Assert.Contains("no se edita", error.Message);
        Assert.Contains("versión nueva", error.Message);
        Assert.Equal(questions, model.VersionOf(1).Questions.Count);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GuardarUnaSeccionDevuelveLaValidacionActualizada()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        GetModelVersionValidationResponse response =
            await new SaveModelMixUseCase(_repository.Object, _unitOfWork.Object).ExecuteAsync(
                new SaveMixCommand(model.Id, 1, new SaveMixRequest(
                    Author,
                    [
                        new MixRowInput("backend", "Backend", EstimationModelBuilder.Column(60m, 50m, 50m, 40m, 40m)),
                        new MixRowInput("frontend", "Frontend", EstimationModelBuilder.Column(20m, 30m, 25m, 30m, 30m)),
                        // La columna XS queda en 99: la respuesta lo dice y la
                        // publicación queda bloqueada, sin tener que preguntar.
                        new MixRowInput("qa", "QA", EstimationModelBuilder.Column(19m, 20m, 25m, 30m, 30m)),
                    ],
                    [])));

        Assert.False(response.Report.CanPublish);
        ModelValidationCheckDto failed = Assert.Single(
            response.Report.Checks.Where(c => c.Status == "impedimento"));
        Assert.Equal(ModelVersionValidation.CheckMix, failed.Code);
        Assert.Equal(ModelVersion.SectionMix, failed.Section);
        Assert.Contains("XS", failed.Missing);
    }

    [Fact]
    public async Task GuardarLosPesosNoPisaElTextoDeLaPregunta()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());
        string texto = model.VersionOf(1).Questions.Single(q => q.Code == "Q1").Texto;

        await new SaveModelDriversUseCase(_repository.Object, _unitOfWork.Object).ExecuteAsync(
            new SaveDriversCommand(model.Id, 1, new SaveDriversRequest(
                Author,
                [
                    new ModelDriverInput("VOL", "Volumen", ["Size", "Effort"]),
                    new ModelDriverInput("INC", "Incertidumbre", ["Risk"]),
                    new ModelDriverInput("INT", "Integración", ["Size", "Mix"]),
                ],
                [new QuestionWeightsInput("Q1", new Dictionary<string, decimal> { ["Size"] = 9m })])));

        ModelQuestion question = model.VersionOf(1).Questions.Single(q => q.Code == "Q1");
        Assert.Equal(texto, question.Texto);
        Assert.Equal(9m, question.Weights[EstimationOutput.Size]);
        // Effort venía con peso y no llegó en el cuerpo: se fue, que es lo que
        // significa mandar la fila entera.
        Assert.False(question.Weights.ContainsKey(EstimationOutput.Effort));
    }

    [Fact]
    public async Task GuardarLasDimensionesConservaLosPesosQueLasPreguntasYaTenian()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());

        await new SaveModelDimensionsUseCase(_repository.Object, _unitOfWork.Object).ExecuteAsync(
            new SaveDimensionsCommand(model.Id, 1, new SaveDimensionsRequest(
                Author,
                [
                    new ModelDimensionInput("ALC", "Alcance renombrado", 1, true),
                    new ModelDimensionInput("RSG", "Riesgo", 2, true),
                ],
                [
                    new ModelQuestionInput(
                        "Q3", "RSG", "¿Depende de un proveedor externo?", "Binaria", null, "INC", true,
                        [
                            new QuestionOptionInput("No", 0m, null, null),
                            new QuestionOptionInput("Sí", 1m, null, null),
                        ]),
                ],
                [new TriageQuestionInput("T1", "¿Toca datos personales?", true)])));

        ModelQuestion question = model.VersionOf(1).Questions.Single();
        Assert.Equal("Alcance renombrado", model.VersionOf(1).Dimensions.First().Name);
        Assert.Equal(3m, question.Weights[EstimationOutput.Risk]);
    }

    // ── Publicación ──────────────────────────────────────────────────────────

    [Fact]
    public async Task PublicarConImpedimentosNoPublicaYDevuelveElInforme()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithValidDraft());
        model.VersionOf(1).ReplaceRiskBands([], Author, EstimationModelBuilder.At);

        PublishModelVersionResponse response =
            await new PublishModelVersionUseCase(_repository.Object, _unitOfWork.Object).ExecuteAsync(
                new PublishModelVersionCommand(
                    model.Id, 1, new PublishModelVersionRequest(Author, new DateOnly(2026, 6, 1), "Nota.")));

        // El endpoint traduce esto a 422 con el informe en el cuerpo: el cliente
        // necesita la lista para llevar a arreglar cada impedimento.
        Assert.False(response.Published);
        Assert.False(response.Report.CanPublish);
        Assert.Equal(1, response.Report.ImpedimentCount);
        Assert.Equal(ModelVersionStatus.Borrador, model.VersionOf(1).Status);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task PublicarUnaVersionValidaLaDejaVigenteYArchivaLaAnterior()
    {
        EstimationModel model = Have(EstimationModelBuilder.WithPublishedAndDraft());
        EstimationModelBuilder.FillValid(model.VersionOf(2));

        PublishModelVersionResponse response =
            await new PublishModelVersionUseCase(_repository.Object, _unitOfWork.Object).ExecuteAsync(
                new PublishModelVersionCommand(
                    model.Id, 2, new PublishModelVersionRequest(Author, new DateOnly(2026, 6, 1), "Segunda.")));

        Assert.True(response.Published);
        Assert.Equal(ModelVersionStatus.Vigente, model.VersionOf(2).Status);
        Assert.Equal(ModelVersionStatus.Archivada, model.VersionOf(1).Status);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
