using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class EstimationModelRepository(ApplicationDbContext dbContext)
    : Repository<EstimationModel>(dbContext), IEstimationModelRepository
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<EstimationModel>> GetAllWithContentAsync(
        CancellationToken cancellationToken = default) =>
        await WithContent().ToListAsync(cancellationToken);

    public async Task<EstimationModel?> GetWithContentAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await WithContent().FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

    public async Task<EstimationModel?> GetByPhaseAsync(
        int phaseNumber,
        CancellationToken cancellationToken = default)
    {
        // La fase se guarda como su nombre; comparar por número exige traerlas,
        // y son tres.
        List<EstimationModel> models = await WithContent().ToListAsync(cancellationToken);
        return models.FirstOrDefault(m => m.Phase.Number == phaseNumber);
    }

    public async Task<IReadOnlyDictionary<Guid, int>> CountEstimationsByVersionAsync(
        CancellationToken cancellationToken = default)
    {
        // La evaluación vive en una columna JSON, así que el conteo se hace en
        // memoria: no hay columna por la que agrupar. Con el volumen de
        // iniciativas de la plataforma no compensa promover la versión a
        // columna sólo para esta cuenta; si algún día pesa, se promueve.
        List<Initiative> evaluated = await _dbContext.Initiatives
            .AsNoTracking()
            .Where(i => i.Evaluation != null)
            .ToListAsync(cancellationToken);

        return evaluated
            .Where(i => i.Evaluation!.ModelVersionId != Guid.Empty)
            .GroupBy(i => i.Evaluation!.ModelVersionId)
            .ToDictionary(group => group.Key, group => group.Count());
    }

    private IQueryable<EstimationModel> WithContent() =>
        DbSet
            .Include(m => m.Versions).ThenInclude(v => v.Dimensions)
            .Include(m => m.Versions).ThenInclude(v => v.Drivers)
            .Include(m => m.Versions).ThenInclude(v => v.Questions).ThenInclude(q => q.Options)
            .Include(m => m.Versions).ThenInclude(v => v.TriageQuestions)
            .Include(m => m.Versions).ThenInclude(v => v.TallaRules)
            .Include(m => m.Versions).ThenInclude(v => v.RiskBands)
            .Include(m => m.Versions).ThenInclude(v => v.Mix)
            .Include(m => m.Versions).ThenInclude(v => v.MixModifiers).ThenInclude(m => m.Adjustments)
            .Include(m => m.Versions).ThenInclude(v => v.History);
}
