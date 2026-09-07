using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;

public sealed record SaveTallaBandsResponse(TallaBandsDto Bands);

/// <summary>
/// Guarda las bandas. El orden en que llegan es el que se guarda y el que se
/// responde: la posición de cada banda sale de su índice en el cuerpo.
/// </summary>
public sealed class SaveTallaBandsUseCase(
    ISingleDocumentRepository<TallaBandSet> repository,
    IUnitOfWork unitOfWork,
    IValidator<SaveTallaBandsRequest> validator)
    : IUseCase<SaveTallaBandsRequest, SaveTallaBandsResponse>
{
    public async Task<SaveTallaBandsResponse> ExecuteAsync(
        SaveTallaBandsRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        List<decimal> boundaries = [.. request.Boundaries];
        List<TallaBand> bands = [.. request.Bands.Select((b, i) =>
            new TallaBand(i, b.Talla, b.PmMin, b.PmMax, b.Lectura))];

        TallaBandSet? existing = await repository.GetAsync(cancellationToken);
        if (existing is null)
        {
            var created = new TallaBandSet(boundaries, bands);
            await repository.AddAsync(created, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new SaveTallaBandsResponse(ModelParameterMappings.ToDto(created));
        }

        existing.Replace(boundaries, bands);
        repository.Update(existing);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveTallaBandsResponse(ModelParameterMappings.ToDto(existing));
    }
}
