using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Infrastructure.Persistence;

/// <summary>
/// Crea la versión 1 del modelo de estimación desde los parámetros de fila
/// única, y le pone su versión a cada evaluación ya guardada.
///
/// Corre una sola vez: si ya hay un modelo, no hace nada. Va acá y no en una
/// migración de EF con SQL crudo porque lo que se migra es un grafo —versión,
/// dimensiones, preguntas, opciones, pesos— y escribirlo a mano en SQL sería
/// reimplementar el mapeo, con la diferencia de que nadie lo compilaría.
/// </summary>
public static class EstimationModelMigrator
{
    public static async Task RunAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(services);

        using IServiceScope scope = services.CreateScope();
        ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        ILogger logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(EstimationModelMigrator));

        if (await dbContext.EstimationModels.AnyAsync(cancellationToken))
        {
            return;
        }

        QuestionPool pool =
            await LoadAsync(scope, ModelParameterDefaults.QuestionPool, cancellationToken);
        TallaBandSet bands =
            await LoadAsync(scope, ModelParameterDefaults.TallaBands, cancellationToken);
        CapabilityMix mix =
            await LoadAsync(scope, ModelParameterDefaults.CapabilityMix, cancellationToken);

        DateTime now = DateTime.UtcNow;
        EstimationModel model = LegacyModelConversion.BuildInitialModel(
            pool,
            bands,
            mix,
            DateOnly.FromDateTime(now),
            now);

        dbContext.EstimationModels.Add(model);
        await dbContext.SaveChangesAsync(cancellationToken);

        ReportUnmetChecks(logger, model);
        await StampExistingEvaluationsAsync(dbContext, model, logger, cancellationToken);
    }

    /// <summary>
    /// Deja en el log qué chequeos de publicación **no** pasa la versión
    /// migrada. Se adopta como vigente sin validarla —describe lo que el sistema
    /// ya hacía— y esta es la contrapartida: quien arme la versión 2 tiene que
    /// poder ver qué hay que arreglar antes de publicarla, sin descubrirlo
    /// cuando el botón aparezca deshabilitado.
    /// </summary>
    private static void ReportUnmetChecks(ILogger logger, EstimationModel model)
    {
        ModelVersion version = model.CurrentVersion!;
        ModelValidationReport report = ModelVersionValidation.Validate(version);

        if (report.CanPublish && report.Warnings.Count == 0)
        {
            logger.LogInformation(
                "La versión {Version} del modelo migrado pasa los nueve chequeos de publicación.",
                version.Number);
            return;
        }

        foreach (ModelValidationCheck check in report.Impediments)
        {
            logger.LogWarning(
                "La versión {Version} migrada NO pasa el chequeo {Check}: {Missing} (se arregla en «{Section}»). " +
                "Se adopta igual porque describe lo que el sistema ya venía haciendo; la versión siguiente " +
                "tendrá que resolverlo antes de publicarse.",
                version.Number,
                check.Code,
                check.Missing,
                check.Section);
        }

        foreach (ModelValidationCheck check in report.Warnings)
        {
            logger.LogInformation(
                "Advertencia en la versión {Version} migrada, chequeo {Check}: {Missing}",
                version.Number,
                check.Code,
                check.Missing);
        }
    }

    /// <summary>
    /// Le pone a cada evaluación guardada la versión con la que efectivamente se
    /// calculó, que es literalmente la versión 1: son los parámetros que regían.
    /// </summary>
    private static async Task StampExistingEvaluationsAsync(
        ApplicationDbContext dbContext,
        EstimationModel model,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        ModelVersion version = model.CurrentVersion!;
        List<Initiative> initiatives = await dbContext.Initiatives
            .Where(i => i.Evaluation != null)
            .ToListAsync(cancellationToken);

        int stamped = 0;
        foreach (Initiative initiative in initiatives)
        {
            if (initiative.Evaluation is null || initiative.Evaluation.ModelVersionId != Guid.Empty)
            {
                continue;
            }

            initiative.SaveEvaluation(initiative.Evaluation with
            {
                ModelVersionId = version.Id,
                ModelVersionNumber = version.Number,
            });
            stamped++;
        }

        if (stamped > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        logger.LogInformation(
            "Se asignó la versión {Version} a {Count} evaluaciones ya guardadas.",
            version.Number,
            stamped);
    }

    private static async Task<T> LoadAsync<T>(
        IServiceScope scope,
        Func<T> fallback,
        CancellationToken cancellationToken)
        where T : AggregateRoot
    {
        ISingleDocumentRepository<T> repository =
            scope.ServiceProvider.GetRequiredService<ISingleDocumentRepository<T>>();

        return await repository.GetAsync(cancellationToken) ?? fallback();
    }
}
