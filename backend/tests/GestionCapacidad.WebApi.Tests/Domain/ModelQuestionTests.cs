using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ModelQuestionTests
{
    private static readonly Dictionary<EstimationOutput, decimal> SomeWeight =
        new() { [EstimationOutput.Size] = 1m };

    private static ModelQuestion Build(
        EstimationQuestionType type,
        string? unit,
        params ModelQuestionOption[] options) =>
        new(0, "Q1", "ALC", "¿Cuánto?", type, unit, "VOL", active: true, options, SomeWeight);

    [Fact]
    public void DosOpcionesConElMismoPuntajeSeRechazan()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Evaluativa,
            null,
            new ModelQuestionOption(0, "Baja", 0.5m, null, null),
            new ModelQuestionOption(1, "Media", 0.5m, null, null)));

        Assert.Contains("mismo puntaje normalizado", error.Message);
    }

    [Fact]
    public void LosTramosSolapadosSeRechazan()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Cuantitativa,
            "pantallas",
            new ModelQuestionOption(0, "1 a 10", 0m, 1m, 10m),
            new ModelQuestionOption(1, "5 en adelante", 1m, 5m, null)));

        Assert.Contains("hueco o se solapan", error.Message);
    }

    [Fact]
    public void UnHuecoEntreTramosSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Cuantitativa,
            "pantallas",
            new ModelQuestionOption(0, "1 a 5", 0m, 1m, 5m),
            new ModelQuestionOption(1, "10 en adelante", 1m, 10m, null)));

        Assert.Contains("hueco o se solapan", error.Message);
    }

    [Fact]
    public void ElUltimoTramoTieneQueQuedarSinTope()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Cuantitativa,
            "pantallas",
            new ModelQuestionOption(0, "1 a 5", 0m, 1m, 5m),
            new ModelQuestionOption(1, "6 a 20", 1m, 5m, 20m)));

        Assert.Contains("sin tope", error.Message);
    }

    [Fact]
    public void UnaCuantitativaSinUnidadSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Cuantitativa,
            null,
            new ModelQuestionOption(0, "1 a 5", 0m, 1m, 5m),
            new ModelQuestionOption(1, "más de 5", 1m, 5m, null)));

        Assert.Contains("unidad", error.Message);
    }

    [Fact]
    public void UnaPreguntaConUnaSolaOpcionSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Evaluativa,
            null,
            new ModelQuestionOption(0, "Única", 1m, null, null)));

        Assert.Contains("al menos dos opciones", error.Message);
    }

    [Fact]
    public void UnaBinariaConTresOpcionesSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Binaria,
            null,
            new ModelQuestionOption(0, "No", 0m, null, null),
            new ModelQuestionOption(1, "Quizá", 0.5m, null, null),
            new ModelQuestionOption(2, "Sí", 1m, null, null)));

        Assert.Contains("exactamente dos opciones", error.Message);
    }

    [Fact]
    public void SoloUnaCuantitativaDefineTramos()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(
            EstimationQuestionType.Evaluativa,
            null,
            new ModelQuestionOption(0, "Baja", 0m, 1m, 5m),
            new ModelQuestionOption(1, "Alta", 1m, 5m, null)));

        Assert.Contains("no lo es", error.Message);
    }

    [Theory]
    [InlineData(1, "1 a 5")]
    [InlineData(5, "1 a 5")]
    [InlineData(6, "6 a 20")]
    [InlineData(20, "6 a 20")]
    [InlineData(21, "más de 20")]
    [InlineData(9999, "más de 20")]
    public void UnNumeroCaeEnSuTramo(int answer, string expected)
    {
        ModelQuestion question = EstimationModelBuilder.ValidQuestions().First();

        ModelQuestionOption? option = question.Resolve(null, answer);

        Assert.NotNull(option);
        Assert.Equal(expected, option.Label);
    }

    [Fact]
    public void UnNumeroPorDebajoDelPrimerTramoNoCaeEnNinguno()
    {
        ModelQuestion question = EstimationModelBuilder.ValidQuestions().First();

        Assert.Null(question.Resolve(null, 0));
    }

    [Fact]
    public void UnPesoAusenteNoEsUnPesoDeCero()
    {
        List<ModelQuestion> questions = [.. EstimationModelBuilder.ValidQuestions()];

        ModelQuestion soloRiesgo = questions.Single(q => q.Code == "Q3");
        ModelQuestion pesaCero = questions.Single(q => q.Code == "Q4");

        Assert.False(soloRiesgo.Weights.ContainsKey(EstimationOutput.Size));
        Assert.True(pesaCero.Weights.ContainsKey(EstimationOutput.Size));
        Assert.Equal(0m, pesaCero.Weights[EstimationOutput.Size]);
    }
}
