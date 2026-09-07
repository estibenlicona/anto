using FluentValidation.Results;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;

namespace GestionCapacidad.WebApi.Tests.Validators;

public sealed class SaveSprintConfigValidatorTests
{
    private readonly SaveSprintConfigValidator _validator = new();

    private static SaveSprintConfigRequest Valid() => new(2, 6, 80m, "23:00", 6, 3);

    [Fact]
    public void Validate_WithTheReferenceCalendar_HasNoErrors()
    {
        Assert.True(_validator.Validate(Valid()).IsValid);
    }

    [Fact]
    public void Validate_WithHoursOutOfRange_ReportsTheHoursMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { HoursPerSprint = 500m });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("horas por sprint deben estar entre 20 y 400"));
    }

    [Fact]
    public void Validate_WithMinAboveWindow_ReportsTheCrossFieldMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { HistoryWindowSprints = 4, MinHistorySprints = 6 });

        Assert.Contains(result.Errors, e =>
            e.ErrorMessage == "El mínimo de sprints para evaluar no puede superar la ventana de histórico.");
    }

    [Theory]
    [InlineData("24:00")]
    [InlineData("7:00")]
    [InlineData("")]
    public void Validate_WithInvalidCloseTime_ReportsTheFormatMessage(string closeTime)
    {
        ValidationResult result = _validator.Validate(Valid() with { SprintCloseTime = closeTime });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("HH:mm"));
    }

    [Fact]
    public void Validate_WithWeeksOutOfRange_ReportsTheWeeksMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { Weeks = 5 });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("semanas por sprint"));
    }

    [Fact]
    public void Validate_WithSprintsPerQuarterOutOfRange_ReportsItsMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { SprintsPerQuarter = 9 });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("sprints por quarter"));
    }
}

public sealed class SaveTallaBandsValidatorTests
{
    private readonly SaveTallaBandsValidator _validator = new();

    private static List<TallaBandDto> ValidBands() =>
    [
        new("XS", 0.5m, 1m, "Cambio menor"),
        new("S", 1m, 3m, "Ajuste puntual"),
        new("M", 3m, 6m, "Iniciativa media"),
        new("L", 6m, 10m, "Iniciativa grande"),
        new("XL", 10m, 18m, "Transformación mayor"),
    ];

    private static SaveTallaBandsRequest Valid() => new([20m, 40m, 60m, 80m], ValidBands());

    [Fact]
    public void Validate_WithTheReferenceBands_HasNoErrors()
    {
        Assert.True(_validator.Validate(Valid()).IsValid);
    }

    [Fact]
    public void Validate_WithBoundariesTooClose_ReportsThePartitionMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { Boundaries = [20m, 24m, 60m, 80m] });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("crecientes"));
    }

    [Fact]
    public void Validate_WithBoundariesExactlyAtMinimumWidth_HasNoErrors()
    {
        Assert.True(_validator.Validate(Valid() with { Boundaries = [20m, 25m, 60m, 80m] }).IsValid);
    }

    [Fact]
    public void Validate_WithThreeBoundaries_ReportsTheCountMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { Boundaries = [20m, 40m, 60m] });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("4 cortes"));
    }

    [Fact]
    public void Validate_WithFourBands_ReportsTheCountMessage()
    {
        ValidationResult result = _validator.Validate(Valid() with { Bands = [.. ValidBands().Take(4)] });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("5 bandas"));
    }

    [Fact]
    public void Validate_WithPmMinAbovePmMax_NamesTheBand()
    {
        List<TallaBandDto> bands = ValidBands();
        bands[2] = new TallaBandDto("M", 6m, 3m, "Iniciativa media");

        ValidationResult result = _validator.Validate(Valid() with { Bands = bands });

        Assert.Contains(result.Errors, e =>
            e.ErrorMessage == "El persona-mes mínimo de la talla M no puede superar su máximo.");
    }

    [Fact]
    public void Validate_WithRepeatedTalla_NamesTheRepeatedOne()
    {
        List<TallaBandDto> bands = ValidBands();
        bands[4] = new TallaBandDto("xs", 10m, 18m, "Transformación mayor");

        ValidationResult result = _validator.Validate(Valid() with { Bands = bands });

        Assert.Contains(result.Errors, e => e.ErrorMessage == "La talla se repite: xs.");
    }

    [Fact]
    public void Validate_WithBlankLectura_ReportsIt()
    {
        List<TallaBandDto> bands = ValidBands();
        bands[0] = new TallaBandDto("XS", 0.5m, 1m, "   ");

        ValidationResult result = _validator.Validate(Valid() with { Bands = bands });

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("lectura"));
    }
}

public sealed class SaveCapabilityMixValidatorTests
{
    private readonly SaveCapabilityMixValidator _validator = new();

    private static CapabilityMixRowDto Row(string id, string capacidad, int m = 1) =>
        new(id, capacidad, new Dictionary<string, int> { ["M"] = m });

    [Fact]
    public void Validate_WithTwoDistinctRows_HasNoErrors()
    {
        var request = new SaveCapabilityMixRequest([Row("backend-dev", "Backend Dev"), Row("qa", "QA Engineer")]);

        Assert.True(_validator.Validate(request).IsValid);
    }

    [Fact]
    public void Validate_WithEmptyList_HasNoErrors()
    {
        Assert.True(_validator.Validate(new SaveCapabilityMixRequest([])).IsValid);
    }

    [Fact]
    public void Validate_WithRepeatedId_NamesIt()
    {
        var request = new SaveCapabilityMixRequest([Row("qa", "QA Engineer"), Row("qa", "Otra")]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage == "El id de la capacidad se repite: qa.");
    }

    [Fact]
    public void Validate_WithSameNameInDifferentCasing_NamesIt()
    {
        var request = new SaveCapabilityMixRequest([Row("qa-1", "QA Engineer"), Row("qa-2", " qa engineer ")]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage.StartsWith("El nombre de la capacidad se repite:"));
    }

    [Fact]
    public void Validate_WithNegativeAmount_NamesTheCapabilityAndTheTalla()
    {
        var request = new SaveCapabilityMixRequest([Row("qa", "QA Engineer", m: -1)]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e =>
            e.ErrorMessage == "La cantidad de QA Engineer para la talla M debe ser un entero mayor o igual a 0.");
    }

    [Fact]
    public void Validate_WithBlankName_ReportsIt()
    {
        var request = new SaveCapabilityMixRequest([Row("qa", "  ")]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage == "El nombre de la capacidad es obligatorio.");
    }
}

public sealed class SaveQuestionPoolValidatorTests
{
    private readonly SaveQuestionPoolValidator _validator = new();

    private static QuestionPoolRowDto Question(string id, string dimension = "Negocio y cliente", int peso = 2) =>
        new(id, dimension, $"¿Texto de {id}?", peso);

    [Fact]
    public void Validate_WithTwoDistinctQuestions_HasNoErrors()
    {
        var request = new SaveQuestionPoolRequest([Question("N1"), Question("N2")]);

        Assert.True(_validator.Validate(request).IsValid);
    }

    [Fact]
    public void Validate_WithUnknownDimension_NamesTheQuestion()
    {
        var request = new SaveQuestionPoolRequest([Question("N9", dimension: "Dimensión inventada")]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage == "La dimensión de la pregunta N9 no existe.");
    }

    [Fact]
    public void Validate_WithPesoBelowOne_NamesTheQuestion()
    {
        var request = new SaveQuestionPoolRequest([Question("N9", peso: 0)]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e =>
            e.ErrorMessage == "El peso de la pregunta N9 debe ser un entero mayor o igual a 1.");
    }

    [Fact]
    public void Validate_WithRepeatedId_NamesIt()
    {
        var request = new SaveQuestionPoolRequest([Question("N1"), Question("N1")]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage == "El id de la pregunta se repite: N1.");
    }

    [Fact]
    public void Validate_WithBlankText_NamesTheQuestion()
    {
        var request = new SaveQuestionPoolRequest([new QuestionPoolRowDto("N1", "Integraciones", "  ", 2)]);

        ValidationResult result = _validator.Validate(request);

        Assert.Contains(result.Errors, e => e.ErrorMessage == "El texto de la pregunta N1 es obligatorio.");
    }

    [Fact]
    public void Validate_WithTheReferenceDimensions_AcceptsEachOne()
    {
        var request = new SaveQuestionPoolRequest(
        [
            Question("A", "Negocio y cliente"),
            Question("B", "Alcance funcional"),
            Question("C", "Integraciones"),
            Question("D", "Datos, seguridad y cumplimiento"),
            Question("E", "Tecnología y arquitectura"),
            Question("F", "Operación y soporte"),
            Question("G", "Incertidumbre y dependencias"),
        ]);

        Assert.True(_validator.Validate(request).IsValid);
    }
}
