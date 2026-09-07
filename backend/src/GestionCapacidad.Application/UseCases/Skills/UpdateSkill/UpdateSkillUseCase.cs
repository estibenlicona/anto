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

namespace GestionCapacidad.Application.UseCases.Skills.UpdateSkill;

public sealed record UpdateSkillRequest(Guid Id, string Name, string Group, string Description);

public sealed record UpdateSkillResponse(SkillDto Skill);

/// <summary>Edita nombre, grupo y descripción; el nombre sigue siendo único, excluyendo la propia habilidad.</summary>
public sealed class UpdateSkillUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateSkillRequest> validator) : IUseCase<UpdateSkillRequest, UpdateSkillResponse>
{
    public async Task<UpdateSkillResponse> ExecuteAsync(
        UpdateSkillRequest request,
        CancellationToken cancellationToken = default)
    {
        Skill? skill = await skillRepository.GetByIdAsync(request.Id, cancellationToken);
        if (skill is null)
        {
            throw new NotFoundException("Habilidad no encontrada");
        }

        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        if (await skillRepository.ExistsByNameAsync(request.Name, request.Id, cancellationToken))
        {
            throw new BadRequestException($"Ya existe una habilidad llamada \"{request.Name.Trim()}\"");
        }

        skill.UpdateDetails(request.Name, SkillGroup.From(request.Group), request.Description);

        skillRepository.Update(skill);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);

        return new UpdateSkillResponse(SkillCatalogMappings.ToDto(skill, positions));
    }
}
