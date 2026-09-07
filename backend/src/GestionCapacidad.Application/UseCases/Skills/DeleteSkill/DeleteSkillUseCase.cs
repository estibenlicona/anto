using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Skills.DeleteSkill;

public sealed record DeleteSkillRequest(Guid Id);

/// <summary>
/// Borra una habilidad que ninguna evaluación cerrada calificó. Una usada
/// ofrece desactivarla en su lugar — deja de ofrecerse en evaluaciones
/// nuevas, y las que ya la usaron la conservan.
/// </summary>
public sealed class DeleteSkillUseCase(
    ISkillRepository skillRepository,
    IAssessmentRepository assessmentRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteSkillRequest>
{
    public async Task ExecuteAsync(DeleteSkillRequest request, CancellationToken cancellationToken = default)
    {
        Skill? skill = await skillRepository.GetByIdAsync(request.Id, cancellationToken);
        if (skill is null)
        {
            throw new NotFoundException("Habilidad no encontrada");
        }

        if (await assessmentRepository.ExistsUsingClosedSkillAsync(request.Id, cancellationToken))
        {
            throw new BadRequestException(
                $"\"{skill.Name}\" ya se usó en evaluaciones cerradas y no se puede eliminar. " +
                "Desactivarla la saca de las evaluaciones nuevas y deja las anteriores como están.");
        }

        skillRepository.Delete(skill);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
