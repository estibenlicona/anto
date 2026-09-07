using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class AssessmentRepository(ApplicationDbContext dbContext)
    : Repository<Assessment>(dbContext), IAssessmentRepository
{
    public async Task<IReadOnlyList<Assessment>> GetByPersonAndCycleAsync(
        Guid personId,
        string cycle,
        CancellationToken cancellationToken = default) =>
        await DbSet
            .Where(a => a.PersonId == personId && a.Cycle == cycle)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsUsingClosedSkillAsync(Guid skillId, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Assessment> closed = await DbSet
            .Where(a => a.Status == AssessmentStatus.Closed)
            .ToListAsync(cancellationToken);

        return closed.Any(a => a.Skills.Any(s => s.SkillId == skillId && s.Level is not null));
    }
}
