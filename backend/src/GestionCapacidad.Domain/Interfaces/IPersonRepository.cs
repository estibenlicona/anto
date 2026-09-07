using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IPersonRepository : IRepository<Person>
{
    Task<bool> ExistsByDocumentIdAsync(string documentId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByUserPrincipalNameAsync(string upn, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Person>> GetByChapterAsync(Guid chapterId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Person>> GetByExpertiseLineAsync(Guid expertiseLineId, CancellationToken cancellationToken = default);

    /// <summary>Quién tiene hoy esta identidad DevOps vinculada, si alguien — para la guarda de vincular en Detalle de persona.</summary>
    Task<Person?> GetByDevOpsUserIdAsync(string devOpsUserId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Person> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<int>? levels = null,
        IReadOnlyCollection<string>? seniorities = null,
        IReadOnlyCollection<string>? stacks = null,
        CancellationToken cancellationToken = default);
}
