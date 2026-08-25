using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IPersonRepository : IRepository<Person>
{
    Task<bool> ExistsByDocumentIdAsync(string documentId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByUserPrincipalNameAsync(string upn, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Person>> GetByChapterAsync(Guid chapterId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Person> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<int>? seniorities = null,
        CancellationToken cancellationToken = default);
}
