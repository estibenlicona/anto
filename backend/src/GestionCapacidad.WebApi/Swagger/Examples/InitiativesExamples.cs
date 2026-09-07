using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.WebApi.Endpoints;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class InitiativeDtoExample : IExamplesProvider<InitiativeDto>
{
    public InitiativeDto GetExamples() => new(
        Id: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        Name: "Kafka Migration",
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        SquadName: "Backend Platform",
        ProductOwner: "Paola Henao",
        TargetMonths: 6,
        Status: "Active",
        Evaluation: new InitiativeEvaluationExample().GetExamples(),
        CreatedAtUtc: DateTime.Parse("2026-05-04T00:00:00Z"),
        SquadHasOtherActive: false);
}

/// <summary>
/// Una evaluación de talla M a 6 meses: los números que produce el motor con
/// el modelo de referencia.
/// </summary>
public sealed class InitiativeEvaluationExample : IExamplesProvider<InitiativeEvaluationDto>
{
    public InitiativeEvaluationDto GetExamples() => new(
        Triage: [true, false, false, true, false, false],
        Answers: new Dictionary<string, int> { ["N1"] = 2, ["N2"] = 2, ["F1"] = 2 },
        TargetMonths: 6,
        Points: 126m,
        MaxPoints: 280m,
        Pct: 45m,
        Talla: "M",
        PmMin: 3m,
        PmMax: 6m,
        FteExpected: 0.75m,
        FteMin: 0.5m,
        FteMax: 1m,
        Dimensions:
        [
            new DimensionResultDto("Negocio y cliente", 4, 4, 16m, 32m, 50m, 11m),
            new DimensionResultDto("Alcance funcional", 4, 4, 20m, 40m, 50m, 14m),
        ],
        Mix:
        [
            new MixResultDto("Backend Dev", 3m, 60m, 0.45m),
            new MixResultDto("QA Engineer", 1m, 20m, 0.15m),
            new MixResultDto("Arquitecto", 1m, 20m, 0.15m),
        ],
        TriageVerdict: "Recommended",
        SavedAtUtc: DateTime.Parse("2026-05-04T00:00:00Z"));
}

public sealed class CreateInitiativeRequestExample : IExamplesProvider<CreateInitiativeRequest>
{
    public CreateInitiativeRequest GetExamples() => new(
        Name: "Pago con QR en App",
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        ProductOwner: "Diego Cardona",
        TargetMonths: 6);
}

public sealed class UpdateInitiativeRequestExample : IExamplesProvider<UpdateInitiativeRequest>
{
    public UpdateInitiativeRequest GetExamples() => new(
        Id: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        Name: "Pago con QR en App",
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        ProductOwner: "Diego Cardona",
        TargetMonths: 9);
}

/// <summary>
/// Sólo se mandan respuestas: puntos, talla, FTE y composición los calcula el
/// servidor con el modelo vigente.
/// </summary>
public sealed class SaveEvaluationBodyExample : IExamplesProvider<SaveEvaluationBody>
{
    public SaveEvaluationBody GetExamples() => new(
        Triage: [true, false, false, true, false, false],
        Answers: new Dictionary<string, int> { ["N1"] = 2, ["N2"] = 2, ["N3"] = 2, ["N4"] = 1 },
        TargetMonths: 6);
}

public sealed class SetInitiativeStatusBodyExample : IExamplesProvider<SetInitiativeStatusBody>
{
    public SetInitiativeStatusBody GetExamples() => new("Active");
}

public sealed class InitiativesStatsDtoExample : IExamplesProvider<InitiativesStatsDto>
{
    public InitiativesStatsDto GetExamples() => new(
        Total: 7,
        Unevaluated: 2,
        Active: 3,
        ActiveByTalla:
        [
            new TallaBucketDto("XS", 0),
            new TallaBucketDto("S", 1),
            new TallaBucketDto("M", 2),
            new TallaBucketDto("L", 0),
            new TallaBucketDto("XL", 0),
        ],
        FteDemand: 2m);
}
