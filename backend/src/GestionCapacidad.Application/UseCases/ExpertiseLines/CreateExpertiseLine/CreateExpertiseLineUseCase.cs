using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.CreateExpertiseLine;

public sealed record CreateExpertiseLineRequest(string Name, string Code, string? Description);

public sealed record CreateExpertiseLineResponse(ExpertiseLineDto Line);

/// <summary>Alta de una línea de expertise: nace activa, sin gente ni lead.</summary>
public sealed class CreateExpertiseLineUseCase(
    IExpertiseLineRepository lineRepository,
    IUnitOfWork unitOfWork) : IUseCase<CreateExpertiseLineRequest, CreateExpertiseLineResponse>
{
    public async Task<CreateExpertiseLineResponse> ExecuteAsync(
        CreateExpertiseLineRequest request, CancellationToken cancellationToken = default)
    {
        if (await lineRepository.ExistsByNameAsync(request.Name, cancellationToken: cancellationToken))
        {
            throw new BadRequestException($"Ya existe una línea activa con el nombre '{request.Name}'");
        }

        if (await lineRepository.ExistsByCodeAsync(request.Code, cancellationToken: cancellationToken))
        {
            throw new BadRequestException($"Ya existe una línea con el código '{request.Code.Trim().ToUpperInvariant()}'");
        }

        ExpertiseLine line;
        try
        {
            line = new ExpertiseLine(request.Name, request.Code, request.Description);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        await lineRepository.AddAsync(line, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateExpertiseLineResponse(ExpertiseLineMappings.ToDto(line, [], null));
    }
}
