using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;

public sealed record SaveQuestionPoolResponse(IReadOnlyList<QuestionPoolRowDto> Questions);

/// <summary>
/// Guarda el pool. Editar, agregar y quitar preguntas se confirma todo junto:
/// el cuerpo es la lista completa, no un parche.
/// </summary>
public sealed class SaveQuestionPoolUseCase(
    ISingleDocumentRepository<QuestionPool> repository,
    IUnitOfWork unitOfWork,
    IValidator<SaveQuestionPoolRequest> validator)
    : IUseCase<SaveQuestionPoolRequest, SaveQuestionPoolResponse>
{
    public async Task<SaveQuestionPoolResponse> ExecuteAsync(
        SaveQuestionPoolRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        // La dimensión ya pasó por el validador, así que From no puede fallar acá.
        List<PoolQuestion> questions = [.. request.Questions.Select((q, i) =>
            new PoolQuestion(i, q.Id, QuestionDimension.From(q.Dimension), q.Texto, q.Peso))];

        QuestionPool? existing = await repository.GetAsync(cancellationToken);
        if (existing is null)
        {
            var created = new QuestionPool(questions);
            await repository.AddAsync(created, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new SaveQuestionPoolResponse(ModelParameterMappings.ToDto(created));
        }

        existing.Replace(questions);
        repository.Update(existing);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveQuestionPoolResponse(ModelParameterMappings.ToDto(existing));
    }
}
