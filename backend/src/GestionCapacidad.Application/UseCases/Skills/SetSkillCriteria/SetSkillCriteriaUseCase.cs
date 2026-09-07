using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Skills.SetSkillCriteria;

public sealed record SetSkillCriteriaRequest(Guid Id, int Level, IReadOnlyList<string> Criteria);

public sealed record SetSkillCriteriaResponse(SkillDto Skill);

/// <summary>Reemplaza en bloque los criterios de un nivel: se editan juntos, y el orden es parte del dato.</summary>
public sealed class SetSkillCriteriaUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetSkillCriteriaRequest, SetSkillCriteriaResponse>
{
    public async Task<SetSkillCriteriaResponse> ExecuteAsync(
        SetSkillCriteriaRequest request,
        CancellationToken cancellationToken = default)
    {
        Skill? skill = await skillRepository.GetByIdAsync(request.Id, cancellationToken);
        if (skill is null)
        {
            throw new NotFoundException("Habilidad no encontrada");
        }

        try
        {
            skill.ReplaceCriteria(request.Level, request.Criteria ?? []);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        skillRepository.Update(skill);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);

        return new SetSkillCriteriaResponse(SkillCatalogMappings.ToDto(skill, positions));
    }
}
