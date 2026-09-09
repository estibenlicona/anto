using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// El runner de los casos dorados del lado del servidor. Su gemelo del frontend
/// es <c>goldenCases.engine.test.ts</c>: los dos leen
/// <c>fixtures/estimation-model/casos-dorados.json</c>, y mientras los dos estén
/// verdes las dos implementaciones del motor coinciden.
///
/// Si este archivo deja de correr, nada avisa que los motores divergieron.
/// </summary>
public sealed class EstimationGoldenCasesTests
{
    [Fact]
    public void ElArchivoDeCasosDoradosEstaDondeLasDosSuitesLoBuscan()
    {
        string directory = EstimationGoldenCases.FixturesDirectory();

        Assert.True(File.Exists(Path.Combine(directory, "casos-dorados.json")));
        Assert.True(File.Exists(Path.Combine(directory, "casos-dorados.schema.json")));
        Assert.True(EstimationGoldenCases.All.Count >= 8);
    }

    [Theory]
    [MemberData(nameof(EstimationGoldenCases.Names), MemberType = typeof(EstimationGoldenCases))]
    public void ElMotorReproduceElCasoDorado(string name)
    {
        GoldenCase golden = EstimationGoldenCases.ByName(name);

        EstimationResult actual = ParametricEstimationEngine.Evaluate(golden.Model, golden.Input);

        AssertOutput("tamaño", golden.Expected.Size, actual.Size.Points, actual.Size.MaxPoints, actual.Size.Pct, actual.Size.Contributes);
        AssertOutput("esfuerzo", golden.Expected.Effort, actual.Effort.Points, actual.Effort.MaxPoints, actual.Effort.Pct, actual.Effort.Contributes);
        AssertOutput("riesgo", golden.Expected.Risk, actual.Risk.Points, actual.Risk.MaxPoints, actual.Risk.Pct, actual.Risk.Contributes);
        Assert.Equal(golden.Expected.Risk.Level, actual.Risk.Level);

        Assert.Equal(golden.Expected.Talla, actual.Talla);
        Assert.Equal(golden.Expected.PmMin, actual.PmMin);
        Assert.Equal(golden.Expected.PmExpected, actual.PmExpected);
        Assert.Equal(golden.Expected.PmMax, actual.PmMax);

        AssertClose("fteMin", golden.Expected.FteMin, actual.FteMin);
        AssertClose("fteExpected", golden.Expected.FteExpected, actual.FteExpected);
        AssertClose("fteMax", golden.Expected.FteMax, actual.FteMax);

        Assert.Equal(golden.Expected.Dimensions.Count, actual.Dimensions.Count);
        foreach ((GoldenDimensionExpectation expected, DimensionScore got) in
                 golden.Expected.Dimensions.Zip(actual.Dimensions))
        {
            Assert.Equal(expected.Dimension, got.Dimension);
            Assert.Equal(expected.Answered, got.Answered);
            Assert.Equal(expected.Total, got.Total);
            Assert.Equal(expected.Points, got.Points);
            Assert.Equal(expected.MaxPoints, got.MaxPoints);
            Assert.Equal(expected.Pct, got.Pct);
            Assert.Equal(expected.WeightPct, got.WeightPct);
        }

        Assert.Equal(golden.Expected.Mix.Count, actual.Mix.Count);
        foreach ((GoldenMixExpectation expected, MixDemand got) in golden.Expected.Mix.Zip(actual.Mix))
        {
            Assert.Equal(expected.Capability, got.Capability);
            Assert.Equal(expected.Pct, got.Pct);
            AssertClose($"fte de {expected.Capability}", expected.Fte, got.Fte);
        }

        // La suma de las porciones tiene que dar el total: es la propiedad que
        // se rompe apenas alguien redondee el FTE por perfil.
        AssertClose("suma del mix", golden.Expected.FteExpected, actual.Mix.Sum(m => m.Fte));

        Assert.Equal(golden.Expected.MixModifiersApplied, actual.MixModifiersApplied);
        Assert.Equal(golden.Expected.Answered, actual.Answered);
        Assert.Equal(golden.Expected.TotalQuestions, actual.TotalQuestions);
        Assert.Equal(golden.Expected.TriageYes, actual.TriageYes);
        Assert.Equal(golden.Expected.TriageVerdict, actual.TriageVerdict);

        foreach (GoldenDerivationExpectation expected in golden.Expected.Derivations)
        {
            AnswerDerivation got = Assert.Single(
                actual.Derivations.Where(d => d.QuestionId == expected.QuestionId));

            Assert.Equal(expected.Raw, got.Raw);
            Assert.Equal(expected.OptionLabel, got.OptionLabel);
            Assert.Equal(expected.Score, got.Score);
            Assert.Equal(expected.Driver, got.Driver);
            Assert.Equal(expected.Weights, got.Weights);
        }
    }

    private static void AssertOutput(
        string label,
        GoldenOutputExpectation expected,
        decimal points,
        decimal maxPoints,
        decimal pct,
        IReadOnlyList<string> contributes)
    {
        Assert.Equal(expected.Points, points);
        Assert.Equal(expected.MaxPoints, maxPoints);
        Assert.Equal(expected.Pct, pct);
        // Las preguntas que aportan a la salida: una que "no aporta" no está en
        // la lista, una que pesa cero sí. Numéricamente da igual; acá no.
        Assert.True(
            expected.Contributes.SequenceEqual(contributes),
            $"{label}: esperaba [{string.Join(", ", expected.Contributes)}], llegó [{string.Join(", ", contributes)}]");
    }

    private static void AssertClose(string label, decimal expected, decimal actual)
    {
        decimal difference = Math.Abs(expected - actual);
        Assert.True(
            difference <= EstimationGoldenCases.Tolerance,
            $"{label}: esperaba {EstimationGoldenCases.Text(expected)}, llegó {EstimationGoldenCases.Text(actual)} " +
            $"(diferencia {EstimationGoldenCases.Text(difference)} > tolerancia {EstimationGoldenCases.Text(EstimationGoldenCases.Tolerance)})");
    }
}
