using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence;

/// <summary>
/// Lleva el modelo migrado a los tres estados —archivada, vigente y borrador—
/// para que la pantalla de Parámetros muestre los tres sin que nadie tenga que
/// crear nada a mano.
///
/// De paso, la versión 2 arregla lo que la 1 no pasaba: le da peso de riesgo a
/// las preguntas de incertidumbre. Así el entorno de desarrollo tiene un modelo
/// con las tres salidas vivas, que es lo que la pantalla de resultado necesita
/// para verse como se diseñó.
/// </summary>
public static class EstimationModelDevelopmentSeeder
{
    private const string Author = "Semilla de desarrollo";

    /// <summary>La dimensión cuyas preguntas pasan a alimentar el riesgo.</summary>
    private const string UncertaintyDimension = "INC";

    public static async Task SeedAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(services);

        using IServiceScope scope = services.CreateScope();
        PersistenceOptions options = scope.ServiceProvider
            .GetRequiredService<IOptions<PersistenceOptions>>().Value;

        if (!Enum.TryParse(options.Provider, ignoreCase: true, out PersistenceProvider provider) ||
            provider is not (PersistenceProvider.InMemory or PersistenceProvider.Postgres))
        {
            return;
        }

        ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        EstimationModel? model = await dbContext.EstimationModels
            .Include(m => m.Versions)
            .FirstOrDefaultAsync(cancellationToken);

        // Sólo sobre el modelo recién migrado: con más de una versión, alguien
        // ya trabajó acá y la semilla no tiene nada que decir.
        if (model is null || model.Versions.Count != 1)
        {
            return;
        }

        BringToThreeStates(model, DateTime.UtcNow);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Lleva el modelo de una sola versión vigente a archivada + vigente +
    /// borrador. Es publica y sin base de datos para que se pueda probar: lo
    /// que importa es la secuencia de estados, no el guardado.
    /// </summary>
    public static void BringToThreeStates(EstimationModel model, DateTime now)
    {
        ArgumentNullException.ThrowIfNull(model);

        ModelVersion second = model.CreateVersionFrom(1, Author, now);
        GiveRiskWeights(second, now);

        // Si la semilla no logra dejar publicable la versión 2, se queda con el
        // borrador y no se inventa una publicación: el estado del modelo tiene
        // que poder explicarse.
        if (!ModelVersionValidation.Validate(second).CanPublish)
        {
            return;
        }

        model.Publish(
            2,
            DateOnly.FromDateTime(now),
            "Las preguntas de incertidumbre pasan a alimentar la salida de riesgo.",
            Author,
            [],
            now);

        model.CreateVersionFrom(2, Author, now);
    }

    /// <summary>
    /// Le da peso de riesgo a las preguntas de incertidumbre y suma el riesgo a
    /// las salidas de su driver. Es el arreglo mínimo del único impedimento que
    /// la versión migrada arrastra.
    /// </summary>
    private static void GiveRiskWeights(ModelVersion version, DateTime now)
    {
        List<ModelDriver> drivers =
        [
            .. version.Drivers.Select(driver =>
                string.Equals(driver.Code, UncertaintyDimension, StringComparison.Ordinal)
                    ? new ModelDriver(driver.Code, driver.Description, [.. driver.Outputs, EstimationOutput.Risk])
                    : driver),
        ];

        version.ReplaceDrivers(drivers, Author, now);

        foreach (ModelQuestion question in version.Questions
                     .Where(q => string.Equals(q.DimensionCode, UncertaintyDimension, StringComparison.Ordinal))
                     .ToList())
        {
            var weights = question.Weights.ToDictionary(pair => pair.Key, pair => pair.Value);

            // El riesgo pesa lo mismo que el tamaño, y el tamaño se mantiene:
            // la incertidumbre sigue contando para la talla porque en el modelo
            // de hoy contaba. Bajarla sería recalibrar, no migrar.
            weights[EstimationOutput.Risk] = weights.GetValueOrDefault(EstimationOutput.Size, 1m);
            version.SetQuestionWeights(question.Code, weights, Author, now);
        }
    }
}
