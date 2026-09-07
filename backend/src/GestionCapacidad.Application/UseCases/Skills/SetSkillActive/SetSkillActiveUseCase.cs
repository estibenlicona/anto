using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Skills.SetSkillActive;

public sealed record SetSkillActiveCommand(Guid Id, bool Active);

public sealed record SetSkillActiveResponse(SkillDto Skill);

/// <summary>Retira o reactiva la habilidad del catálogo vigente: no la destruye, la deja de ofrecer en evaluaciones nuevas.</summary>
public sealed class SetSkillActiveUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetSkillActiveCommand, SetSkillActiveResponse>
{
    public async Task<SetSkillActiveResponse> ExecuteAsync(
        SetSkillActiveCommand request,
        CancellationToken cancellationToken = default)
    {
        Skill? skill = await skillRepository.GetByIdAsync(request.Id, cancellationToken);
        if (skill is null)
        {
            throw new NotFoundException("Habilidad no encontrada");
        }

        skill.SetActive(request.Active);

        skillRepository.Update(skill);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);

        return new SetSkillActiveResponse(SkillCatalogMappings.ToDto(skill, positions));
    }
}
