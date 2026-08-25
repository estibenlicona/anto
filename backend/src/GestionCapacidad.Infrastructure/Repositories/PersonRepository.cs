using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class PersonRepository(ApplicationDbContext dbContext)
    : Repository<Person>(dbContext), IPersonRepository
{
    public async Task<bool> ExistsByDocumentIdAsync(
        string documentId,
        CancellationToken cancellationToken = default) =>
        await DbContext.People.AnyAsync(p => p.DocumentId == documentId, cancellationToken);

    public async Task<bool> ExistsByUserPrincipalNameAsync(
        string upn,
        CancellationToken cancellationToken = default) =>
        await DbContext.People.AnyAsync(p => p.UserPrincipalName == upn, cancellationToken);

    public async Task<IReadOnlyList<Person>> GetByChapterAsync(
        Guid chapterId,
        CancellationToken cancellationToken = default) =>
        await DbContext.People
            .Where(p => p.ChapterId == chapterId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<Person> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<int>? seniorities = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Person> query = DbContext.People.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Position.ToLower().Contains(term));
        }

        if (seniorities is { Count: > 0 })
        {
            List<Seniority> validSeniorities = seniorities
                .Select(TryParseSeniority)
                .Where(s => s is not null)
                .Select(s => s!)
                .ToList();
            query = query.Where(p => validSeniorities.Contains(p.Seniority));
        }

        int totalCount = await query.CountAsync(cancellationToken);

        List<Person> items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    // Un valor de filtro fuera del catálogo no es un error del cliente — viene de
    // un checklist controlado por el propio catálogo, así que simplemente no
    // matchea ninguna persona en vez de devolver 400.
    private static Seniority? TryParseSeniority(int value)
    {
        try
        {
            return Seniority.From(value);
        }
        catch (DomainException)
        {
            return null;
        }
    }
}
