using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

/// <summary>
/// Los ejemplos son los parámetros de referencia — los mismos con los que la
/// API responde antes del primer guardado— para que quien lea Swagger vea la
/// forma exacta que el <c>GET</c> devuelve y pueda pegarla en el <c>PUT</c>.
/// </summary>
public sealed class SprintConfigDtoExample : IExamplesProvider<SprintConfigDto>
{
    public SprintConfigDto GetExamples() =>
        ModelParameterMappings.ToDto(ModelParameterDefaults.SprintConfiguration());
}

public sealed class SaveSprintConfigRequestExample : IExamplesProvider<SaveSprintConfigRequest>
{
    public SaveSprintConfigRequest GetExamples()
    {
        SprintConfigDto config = new SprintConfigDtoExample().GetExamples();
        return new SaveSprintConfigRequest(
            config.Weeks,
            config.SprintsPerQuarter,
            config.HoursPerSprint,
            config.SprintCloseTime,
            config.HistoryWindowSprints,
            config.MinHistorySprints);
    }
}

public sealed class TallaBandsDtoExample : IExamplesProvider<TallaBandsDto>
{
    public TallaBandsDto GetExamples() =>
        ModelParameterMappings.ToDto(ModelParameterDefaults.TallaBands());
}

public sealed class SaveTallaBandsRequestExample : IExamplesProvider<SaveTallaBandsRequest>
{
    public SaveTallaBandsRequest GetExamples()
    {
        TallaBandsDto bands = new TallaBandsDtoExample().GetExamples();
        return new SaveTallaBandsRequest(bands.Boundaries, bands.Bands);
    }
}

public sealed class CapabilityMixRowDtoExample : IExamplesProvider<CapabilityMixRowDto>
{
    public CapabilityMixRowDto GetExamples() =>
        ModelParameterMappings.ToDto(ModelParameterDefaults.CapabilityMix())[0];
}

public sealed class CapabilityMixExample : IExamplesProvider<CapabilityMixRowDto[]>
{
    public CapabilityMixRowDto[] GetExamples() =>
        [.. ModelParameterMappings.ToDto(ModelParameterDefaults.CapabilityMix())];
}

public sealed class QuestionPoolRowDtoExample : IExamplesProvider<QuestionPoolRowDto>
{
    public QuestionPoolRowDto GetExamples() =>
        ModelParameterMappings.ToDto(ModelParameterDefaults.QuestionPool())[0];
}

/// <summary>
/// Una muestra del pool y no las 30 preguntas: el ejemplo está para enseñar la
/// forma, y treinta filas en la página de Swagger la esconden.
/// </summary>
public sealed class QuestionPoolExample : IExamplesProvider<QuestionPoolRowDto[]>
{
    public QuestionPoolRowDto[] GetExamples() =>
        [.. ModelParameterMappings.ToDto(ModelParameterDefaults.QuestionPool()).Take(3)];
}
