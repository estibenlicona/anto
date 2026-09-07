using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Assessments.GetAssessment;

public sealed record GetAssessmentRequest(Guid PersonId, string? Cycle);

public sealed record GetAssessmentResponse(AssessmentDto? Assessment);

/// <summary>
/// La evaluación del ciclo: la en curso si hay una, si no la última cerrada,
/// si no <c>null</c> — no tener evaluación ese ciclo es un estado legítimo de
/// la pantalla, no un error.
/// </summary>
public sealed class GetAssessmentUseCase(
    IAssessmentRepository assessmentRepository,
    IPersonRepository personRepository,
    ISkillRepository skillRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    TimeProvider timeProvider) : IUseCase<GetAssessmentRequest, GetAssessmentResponse>
{
    public async Task<GetAssessmentResponse> ExecuteAsync(
        GetAssessmentRequest request,
        CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        string cycle = string.IsNullOrWhiteSpace(request.Cycle) ? AssessmentCycle.Current(timeProvider) : request.Cycle;

        IReadOnlyList<Assessment> all = await assessmentRepository.GetByPersonAndCycleAsync(
            request.PersonId, cycle, cancellationToken);

        Assessment? found = all.FirstOrDefault(a => a.Status == AssessmentStatus.InProgress)
            ?? all.Where(a => a.Status == AssessmentStatus.Closed).OrderBy(a => a.CreatedAtUtc).LastOrDefault();

        if (found is null)
        {
            return new GetAssessmentResponse(null);
        }

        IReadOnlyList<Skill> skills = await skillRepository.GetAllAsync(cancellationToken);
        int version = await SkillCatalogVersioning.GetCurrentAsync(versionRepository, cancellationToken);

        return new GetAssessmentResponse(
            AssessmentMappings.ToDto(found, person.Name, person.Position, skills, version));
    }
}
