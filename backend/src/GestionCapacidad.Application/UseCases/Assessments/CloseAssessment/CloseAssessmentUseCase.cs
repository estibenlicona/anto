using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Assessments.CloseAssessment;

public sealed record CloseAssessmentRequest(Guid PersonId, Guid AssessmentId);

public sealed record CloseAssessmentResponse(AssessmentDto Assessment);

/// <summary>Cierra la evaluación: exige que todas las habilidades en su alcance tengan nivel, y congela el recorte de cada una.</summary>
public sealed class CloseAssessmentUseCase(
    IAssessmentRepository assessmentRepository,
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IUseCase<CloseAssessmentRequest, CloseAssessmentResponse>
{
    public async Task<CloseAssessmentResponse> ExecuteAsync(
        CloseAssessmentRequest request,
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
        IReadOnlyList<Skill> scope = AssessmentSkillScope.Resolve(assessment, allSkills);

        List<string> pending =
        [
            .. scope
                .Where(skill => assessment.Skills.FirstOrDefault(a => a.SkillId == skill.Id)?.Level is null)
                .Select(skill => skill.Name),
        ];

        if (pending.Count > 0)
        {
            string noun = pending.Count == 1 ? "habilidad" : "habilidades";
            throw new BadRequestException($"Faltan {pending.Count} {noun} sin nivel: {string.Join(", ", pending)}");
        }

        var frozenBySkillId = new Dictionary<Guid, (string SkillName, string Group, IReadOnlyList<IReadOnlyList<string>> Levels, int? ExpectedLevel)>();
        foreach (Skill skill in scope)
        {
            IReadOnlyList<IReadOnlyList<string>> levels =
                [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)];
            int? expectedLevel = skill.Expectations
                .FirstOrDefault(e => string.Equals(e.Position, person.Position, StringComparison.Ordinal))?.Level.Value;
            frozenBySkillId[skill.Id] = (skill.Name, skill.Group.Value, levels, expectedLevel);
        }

        int version = await SkillCatalogVersioning.GetCurrentAsync(versionRepository, cancellationToken);

        try
        {
            assessment.Close(frozenBySkillId, version, timeProvider.GetUtcNow().UtcDateTime);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        assessmentRepository.Update(assessment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CloseAssessmentResponse(
            AssessmentMappings.ToDto(assessment, person.Name, person.Position, allSkills, version));
    }
}
