using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;

public sealed record ChangeInitiativeStatusRequest(Guid Id, string Status);

public sealed record ChangeInitiativeStatusResponse(InitiativeDto Initiative);

/// <summary>
/// Cambia el estado de una iniciativa.
///
/// La regla de "una célula sostiene una sola activa" vive acá y no en el
/// agregado porque necesita ver el resto de las iniciativas de la célula. Las
/// otras dos guardas —activar exige evaluación, cerrar exige estar activa— sí
/// son del dominio; acá se traducen a 400 para no responder un 500 por una
/// regla de negocio conocida.
/// </summary>
public sealed class ChangeInitiativeStatusUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<ChangeInitiativeStatusRequest, ChangeInitiativeStatusResponse>
{
    public async Task<ChangeInitiativeStatusResponse> ExecuteAsync(
        ChangeInitiativeStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        InitiativeStatus status;
        try
        {
            status = InitiativeStatus.From(request.Status);
        }
        catch (DomainException)
        {
            throw new BadRequestException("Estado inválido");
        }

        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
        {
            throw new NotFoundException("Iniciativa no encontrada");
        }

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        // Falta evaluarla se dice antes que "la célula ya tiene otra": cuando
        // ambas cosas son ciertas, evaluarla es lo que el usuario puede hacer
        // ahora mismo, y es el orden en que la pantalla ya lo cuenta.
        if (status == InitiativeStatus.Active &&
            initiative.Evaluation is null &&
            initiative.Status != InitiativeStatus.Active)
        {
            throw new BadRequestException("Para activar una iniciativa primero hay que evaluarla");
        }

        if (status == InitiativeStatus.Active && context.SquadHasOtherActive(initiative))
        {
            throw new BadRequestException(
                "La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.");
        }

        try
        {
            initiative.ChangeStatus(status);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // El contexto se reconstruye: cerrar la activa cambia
        // `squadHasOtherActive` de las demás iniciativas de la célula.
        InitiativeContext updated = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new ChangeInitiativeStatusResponse(updated.ToDto(initiative));
    }
}
