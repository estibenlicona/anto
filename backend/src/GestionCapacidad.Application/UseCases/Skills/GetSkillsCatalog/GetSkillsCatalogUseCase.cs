using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Skills.GetSkillsCatalog;

public sealed record GetSkillsCatalogResponse(SkillsCatalogDto Catalog);

public sealed class GetSkillsCatalogUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository) : IUseCase<GetSkillsCatalogResponse>
{
    public async Task<GetSkillsCatalogResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Skill> skills = await skillRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);
        int version = await SkillCatalogVersioning.GetCurrentAsync(versionRepository, cancellationToken);

        return new GetSkillsCatalogResponse(SkillCatalogMappings.ToDto(version, positions, skills));
    }
}
