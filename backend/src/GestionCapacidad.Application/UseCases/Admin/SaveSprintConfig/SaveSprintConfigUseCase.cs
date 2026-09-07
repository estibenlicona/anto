using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;

public sealed record SaveSprintConfigResponse(SprintConfigDto Config);

/// <summary>
/// Guarda el calendario. La primera vez crea la fila; después reemplaza la
/// que hay — nunca crea una segunda, porque el calendario vigente es uno.
/// </summary>
public sealed class SaveSprintConfigUseCase(
    ISingleDocumentRepository<SprintConfiguration> repository,
    IUnitOfWork unitOfWork,
    IValidator<SaveSprintConfigRequest> validator)
    : IUseCase<SaveSprintConfigRequest, SaveSprintConfigResponse>
{
    public async Task<SaveSprintConfigResponse> ExecuteAsync(
        SaveSprintConfigRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        SprintConfiguration? existing = await repository.GetAsync(cancellationToken);
        if (existing is null)
        {
            var created = new SprintConfiguration(
                request.Weeks,
                request.SprintsPerQuarter,
                request.HoursPerSprint,
                request.SprintCloseTime,
                request.HistoryWindowSprints,
                request.MinHistorySprints);

            await repository.AddAsync(created, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new SaveSprintConfigResponse(ModelParameterMappings.ToDto(created));
        }

        existing.Update(
            request.Weeks,
            request.SprintsPerQuarter,
            request.HoursPerSprint,
            request.SprintCloseTime,
            request.HistoryWindowSprints,
            request.MinHistorySprints);

        repository.Update(existing);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveSprintConfigResponse(ModelParameterMappings.ToDto(existing));
    }
}
