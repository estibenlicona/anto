using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Skills.SetSkillExpectation;

public sealed record SetSkillExpectationRequest(Guid Id, string Position, int? Level);

public sealed record SetSkillExpectationResponse(SkillDto Skill);

/// <summary>
/// Declara (o retira, con nivel nulo) el nivel que un cargo exige. El cargo
/// debe existir entre los vigentes de las personas registradas — no hay
/// nivel que declarar para un cargo que nadie tiene.
/// </summary>
public sealed class SetSkillExpectationUseCase(
    ISkillRepository skillRepository,
    IPersonRepository personRepository,
    ISingleDocumentRepository<SkillCatalogVersion> versionRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetSkillExpectationRequest, SetSkillExpectationResponse>
{
    public async Task<SetSkillExpectationResponse> ExecuteAsync(
        SetSkillExpectationRequest request,
        CancellationToken cancellationToken = default)
    {
        Skill? skill = await skillRepository.GetByIdAsync(request.Id, cancellationToken);
        if (skill is null)
        {
            throw new NotFoundException("Habilidad no encontrada");
        }

        string position = request.Position?.Trim() ?? string.Empty;
        if (position.Length == 0)
        {
            throw new BadRequestException("El cargo es obligatorio");
        }

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(personRepository, cancellationToken);
        if (!positions.Contains(position, StringComparer.Ordinal))
        {
            throw new BadRequestException($"El cargo \"{position}\" no existe entre las personas registradas");
        }

        try
        {
            skill.SetExpectation(position, request.Level);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        skillRepository.Update(skill);
        await SkillCatalogVersioning.IncrementAsync(versionRepository, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SetSkillExpectationResponse(SkillCatalogMappings.ToDto(skill, positions));
    }
}
