using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.UpdateExpertiseLine;

public sealed record UpdateExpertiseLineRequest(Guid Id, string Name, string Code, string? Description);

public sealed record UpdateExpertiseLineResponse(ExpertiseLineDto Line);

/// <summary>Edita nombre, código y descripción de una línea, con las mismas validaciones del alta.</summary>
public sealed class UpdateExpertiseLineUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : IUseCase<UpdateExpertiseLineRequest, UpdateExpertiseLineResponse>
{
    public async Task<UpdateExpertiseLineResponse> ExecuteAsync(
        UpdateExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        if (await lineRepository.ExistsByNameAsync(request.Name, request.Id, cancellationToken))
        {
            throw new BadRequestException($"Ya existe una línea activa con el nombre '{request.Name}'");
        }

        if (await lineRepository.ExistsByCodeAsync(request.Code, request.Id, cancellationToken))
        {
            throw new BadRequestException($"Ya existe una línea con el código '{request.Code.Trim().ToUpperInvariant()}'");
        }

        try
        {
            line.UpdateDetails(request.Name, request.Code, request.Description);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        lineRepository.Update(line);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        Person? lead = line.LeadId is Guid leadId ? await personRepository.GetByIdAsync(leadId, cancellationToken) : null;

        return new UpdateExpertiseLineResponse(ExpertiseLineMappings.ToDto(line, linePeople, lead));
    }
}
