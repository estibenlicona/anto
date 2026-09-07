using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Assessments.OpenAssessment;

public sealed record OpenAssessmentRequest(Guid PersonId);

public sealed record OpenAssessmentResponse(AssessmentDto Assessment);

/// <summary>Abre la evaluación del ciclo vigente; sólo una en curso por persona y ciclo.</summary>
public sealed class OpenAssessmentUseCase(
    IAssessmentRepository assessmentRepository,
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IUseCase<OpenAssessmentRequest, OpenAssessmentResponse>
{
    public async Task<OpenAssessmentResponse> ExecuteAsync(
        OpenAssessmentRequest request,
        CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        string cycle = AssessmentCycle.Current(timeProvider);

        IReadOnlyList<Assessment> existing = await assessmentRepository.GetByPersonAndCycleAsync(
            request.PersonId, cycle, cancellationToken);
        if (existing.Any(a => a.Status == AssessmentStatus.InProgress))
        {
            throw new BadRequestException("Ya hay una evaluación en curso para esta persona y ciclo");
        }

        var assessment = new Assessment(request.PersonId, cycle);
        await assessmentRepository.AddAsync(assessment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Skill> skills = await skillRepository.GetAllAsync(cancellationToken);
        int version = await SkillCatalogVersioning.GetCurrentAsync(versionRepository, cancellationToken);

        return new OpenAssessmentResponse(
            AssessmentMappings.ToDto(assessment, person.Name, person.Position, skills, version));
    }
}
