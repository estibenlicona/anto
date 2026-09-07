using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Assessments.SaveAssessmentSkill;

public sealed record SaveAssessmentSkillCommand(
    Guid PersonId,
    Guid AssessmentId,
    Guid SkillId,
    int Level,
    IReadOnlyList<IReadOnlyList<string>> Met,
    string Note);

public sealed record SaveAssessmentSkillResponse(AssessmentDto Assessment);

/// <summary>
/// Califica una habilidad: nivel alcanzado, criterios marcados (filtrados
/// contra los reales del catálogo — un texto inventado no se guarda) y nota.
/// </summary>
public sealed class SaveAssessmentSkillUseCase(
    IAssessmentRepository assessmentRepository,
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork) : IUseCase<SaveAssessmentSkillCommand, SaveAssessmentSkillResponse>
{
    public async Task<SaveAssessmentSkillResponse> ExecuteAsync(
        SaveAssessmentSkillCommand request,
        CancellationToken cancellationToken = default)
    {
        Assessment? assessment = await assessmentRepository.GetByIdAsync(request.AssessmentId, cancellationToken);
        if (assessment is null || assessment.PersonId != request.PersonId)
        {
            throw new NotFoundException("Evaluación no encontrada");
        }

        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        IReadOnlyList<Skill> allSkills = await skillRepository.GetAllAsync(cancellationToken);
        Skill? skill = AssessmentSkillScope.Resolve(assessment, allSkills).FirstOrDefault(s => s.Id == request.SkillId);
        if (skill is null)
        {
            throw new BadRequestException("Esa habilidad no está en el alcance de la evaluación");
        }

        List<IReadOnlyList<string>> filteredMet = [.. Enumerable.Range(0, 4).Select(i =>
        {
            IReadOnlyList<string> requested = i < request.Met.Count && request.Met[i] is not null ? request.Met[i] : [];
            IReadOnlyList<string> real = skill.Levels.Single(l => l.Level.Value == i + 1).Criteria;
            return (IReadOnlyList<string>)[.. real.Where(requested.Contains)];
        })];

        int? expectedLevel = skill.Expectations
            .FirstOrDefault(e => string.Equals(e.Position, person.Position, StringComparison.Ordinal))?.Level.Value;

        try
        {
            assessment.SaveSkill(request.SkillId, request.Level, filteredMet, request.Note, expectedLevel);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        assessmentRepository.Update(assessment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        int version = await SkillCatalogVersioning.GetCurrentAsync(versionRepository, cancellationToken);

        return new SaveAssessmentSkillResponse(
            AssessmentMappings.ToDto(assessment, person.Name, person.Position, allSkills, version));
    }
}
