using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.ReactivateExpertiseLine;

public sealed record ReactivateExpertiseLineRequest(Guid Id);

public sealed record ReactivateExpertiseLineResponse(ExpertiseLineDto Line);

/// <summary>Reactiva una línea archivada: vuelve con su nombre y su código, sin gente ni lead —los que ya tenía al archivarse.</summary>
public sealed class ReactivateExpertiseLineUseCase(
    IExpertiseLineRepository lineRepository,
    IUnitOfWork unitOfWork) : IUseCase<ReactivateExpertiseLineRequest, ReactivateExpertiseLineResponse>
{
    public async Task<ReactivateExpertiseLineResponse> ExecuteAsync(
        ReactivateExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        try
        {
            line.Reactivate();
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        lineRepository.Update(line);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ReactivateExpertiseLineResponse(ExpertiseLineMappings.ToDto(line, [], null));
    }
}
