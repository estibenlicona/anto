using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;

public sealed record SaveCapabilityMixResponse(IReadOnlyList<CapabilityMixRowDto> Rows);

/// <summary>
/// Guarda el mix. Las capacidades agregadas, quitadas y renombradas se
/// confirman todas juntas: el cuerpo es la lista completa, no un parche.
/// </summary>
public sealed class SaveCapabilityMixUseCase(
    ISingleDocumentRepository<CapabilityMix> repository,
    IUnitOfWork unitOfWork,
    IValidator<SaveCapabilityMixRequest> validator)
    : IUseCase<SaveCapabilityMixRequest, SaveCapabilityMixResponse>
{
    public async Task<SaveCapabilityMixResponse> ExecuteAsync(
        SaveCapabilityMixRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        List<CapabilityMixRow> rows = [.. request.Rows.Select((r, i) =>
            new CapabilityMixRow(i, r.Id, r.Capacidad, r.PorTalla))];

        CapabilityMix? existing = await repository.GetAsync(cancellationToken);
        if (existing is null)
        {
            var created = new CapabilityMix(rows);
            await repository.AddAsync(created, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new SaveCapabilityMixResponse(ModelParameterMappings.ToDto(created));
        }

        existing.Replace(rows);
        repository.Update(existing);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveCapabilityMixResponse(ModelParameterMappings.ToDto(existing));
    }
}
