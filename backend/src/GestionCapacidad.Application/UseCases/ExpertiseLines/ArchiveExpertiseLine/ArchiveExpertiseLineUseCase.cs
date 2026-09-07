using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.ArchiveExpertiseLine;

public sealed record ArchiveExpertiseLineRequest(Guid Id);

public sealed record ArchiveExpertiseLineResponse(ExpertiseLineDto Line);

/// <summary>Archivar exige que la línea no tenga personas — no se pierde de dónde vino cada quien, pero tampoco queda gente huérfana.</summary>
public sealed class ArchiveExpertiseLineUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : IUseCase<ArchiveExpertiseLineRequest, ArchiveExpertiseLineResponse>
{
    public async Task<ArchiveExpertiseLineResponse> ExecuteAsync(
        ArchiveExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        if (linePeople.Count > 0)
        {
            throw new BadRequestException(
                $"La línea tiene {linePeople.Count} persona(s): hay que moverlas antes de archivarla");
        }

        try
        {
            line.Archive();
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        lineRepository.Update(line);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ArchiveExpertiseLineResponse(ExpertiseLineMappings.ToDto(line, [], null));
    }
}
