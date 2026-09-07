using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Skills.CreateSkill;

public sealed record CreateSkillRequest(string Name, string Group, string Description);

public sealed record CreateSkillResponse(SkillDto Skill);

/// <summary>Alta de habilidad: nace incompleta, sin criterios ni expectativas, con los cuatro niveles vacíos.</summary>
public sealed class CreateSkillUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateSkillRequest> validator) : IUseCase<CreateSkillRequest, CreateSkillResponse>
{
    public async Task<CreateSkillResponse> ExecuteAsync(
        CreateSkillRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        if (await skillRepository.ExistsByNameAsync(request.Name, excludeId: null, cancellationToken))
        {
            throw new BadRequestException($"Ya existe una habilidad llamada \"{request.Name.Trim()}\"");
        }

        var skill = new Skill(request.Name, SkillGroup.From(request.Group), request.Description);

        await skillRepository.AddAsync(skill, cancellationToken);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);

        return new CreateSkillResponse(SkillCatalogMappings.ToDto(skill, positions));
    }
}
