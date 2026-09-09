using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// Los defaults del backend son espejo de los del mock del frontend. Estos
/// tests fijan los números que ese espejo debe reproducir: si alguno de los
/// dos lados cambia sin el otro, el test lo señala.
/// </summary>
public sealed class ModelParameterDefaultsTests
{
    [Fact]
    public void SprintConfiguration_MatchesTheReferenceCalendar()
    {
        SprintConfiguration config = ModelParameterDefaults.SprintConfiguration();

        Assert.Equal(2, config.Weeks);
        Assert.Equal(6, config.SprintsPerQuarter);
        Assert.Equal(80m, config.HoursPerSprint);
        Assert.Equal("23:00", config.SprintCloseTime);
        Assert.Equal(6, config.HistoryWindowSprints);
        Assert.Equal(3, config.MinHistorySprints);
    }

    [Fact]
    public void TallaBands_HasTheFourBoundariesAndFiveBands()
    {
        TallaBandSet bands = ModelParameterDefaults.TallaBands();

        Assert.Equal([20m, 40m, 60m, 80m], bands.Boundaries);
        Assert.Equal(["XS", "S", "M", "L", "XL"], bands.Bands.Select(b => b.Talla));
        Assert.Equal(
            ["Cambio menor", "Ajuste puntual", "Iniciativa media", "Iniciativa grande", "Transformación mayor"],
            bands.Bands.Select(b => b.Lectura));
        Assert.Equal([0.5m, 1m, 3m, 6m, 10m], bands.Bands.Select(b => b.PmMin));
        Assert.Equal([1m, 3m, 6m, 10m, 18m], bands.Bands.Select(b => b.PmMax));
    }

    [Fact]
    public void CapabilityMix_HasTheSixCapabilitiesWithTheirAmounts()
    {
        CapabilityMix mix = ModelParameterDefaults.CapabilityMix();

        Assert.Equal(
            ["Backend Dev", "Frontend Dev", "QA Engineer", "Arquitecto", "DevOps Engineer", "Data Engineer"],
            mix.Rows.Select(r => r.Capacidad));
        Assert.Equal(
            ["backend-dev", "frontend-dev", "qa-engineer", "arquitecto", "devops-engineer", "data-engineer"],
            mix.Rows.Select(r => r.Key));

        Assert.Equal([1, 2, 2, 3, 4], AmountsOf(mix, "Backend Dev"));
        Assert.Equal([0, 0, 1, 1, 2], AmountsOf(mix, "Frontend Dev"));
        Assert.Equal([0, 1, 1, 2, 3], AmountsOf(mix, "QA Engineer"));
        Assert.Equal([0, 0, 1, 1, 2], AmountsOf(mix, "Arquitecto"));
        Assert.Equal([0, 0, 0, 1, 1], AmountsOf(mix, "DevOps Engineer"));
        Assert.Equal([0, 0, 0, 0, 1], AmountsOf(mix, "Data Engineer"));

        // Repartir entre más perfiles no movió cuánta gente pide cada talla.
        int[] totales = new[] { "XS", "S", "M", "L", "XL" }
            .Select(talla => mix.Rows.Sum(r => r.PorTalla.TryGetValue(talla, out int n) ? n : 0))
            .ToArray();
        Assert.Equal(new[] { 1, 3, 5, 8, 13 }, totales);
    }

    [Fact]
    public void QuestionPool_HasTheThirtyQuestionsOfTheReferenceModel()
    {
        QuestionPool pool = ModelParameterDefaults.QuestionPool();

        Assert.Equal(30, pool.Questions.Count);
        Assert.Equal(
            ["N1", "N2", "N3", "N4", "F1", "F2", "F3", "F4", "I1", "I2", "I3", "I4",
             "S1", "S2", "S3", "S4", "S5", "T1", "T2", "T3", "T4", "T5",
             "O1", "O2", "O3", "O4", "D1", "D2", "D3", "D4"],
            pool.Questions.Select(q => q.Code));
    }

    [Fact]
    public void QuestionPool_DistributesQuestionsAcrossTheSevenDimensions()
    {
        QuestionPool pool = ModelParameterDefaults.QuestionPool();

        Dictionary<string, int> byDimension = pool.Questions
            .GroupBy(q => q.Dimension.Value)
            .ToDictionary(g => g.Key, g => g.Count());

        Assert.Equal(7, byDimension.Count);
        Assert.Equal(4, byDimension["Negocio y cliente"]);
        Assert.Equal(4, byDimension["Alcance funcional"]);
        Assert.Equal(4, byDimension["Integraciones"]);
        Assert.Equal(5, byDimension["Datos, seguridad y cumplimiento"]);
        Assert.Equal(5, byDimension["Tecnología y arquitectura"]);
        Assert.Equal(4, byDimension["Operación y soporte"]);
        Assert.Equal(4, byDimension["Incertidumbre y dependencias"]);
    }

    [Fact]
    public void QuestionPool_TotalWeightIsSeventy()
    {
        // El máximo de puntos del modelo es 70 × 4 = 280; si el peso total se
        // mueve, los porcentajes de todas las evaluaciones se mueven con él.
        Assert.Equal(70, ModelParameterDefaults.QuestionPool().Questions.Sum(q => q.Peso));
    }

    [Fact]
    public void QuestionPool_QuestionsAppearInDimensionOrder()
    {
        // El orden de aparición define el orden de las dimensiones que el
        // modelo de evaluación expone.
        QuestionPool pool = ModelParameterDefaults.QuestionPool();

        IEnumerable<string> dimensionsInOrder = pool.Questions
            .Select(q => q.Dimension.Value)
            .Distinct();

        Assert.Equal(QuestionDimension.ValidValues.Select(d => d.Value), dimensionsInOrder);
    }

    private static List<int> AmountsOf(CapabilityMix mix, string capacidad)
    {
        CapabilityMixRow row = mix.Rows.Single(r => r.Capacidad == capacidad);
        return [.. new[] { "XS", "S", "M", "L", "XL" }.Select(t => row.PorTalla[t])];
    }
}
