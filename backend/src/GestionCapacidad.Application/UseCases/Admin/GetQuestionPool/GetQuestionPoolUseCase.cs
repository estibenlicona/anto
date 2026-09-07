using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Admin.GetQuestionPool;

public sealed record GetQuestionPoolResponse(IReadOnlyList<QuestionPoolRowDto> Questions);

/// <summary>El pool vigente, o el de referencia si nadie lo ha guardado.</summary>
public sealed class GetQuestionPoolUseCase(ISingleDocumentRepository<QuestionPool> repository)
    : IUseCase<GetQuestionPoolResponse>
{
    public async Task<GetQuestionPoolResponse> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        QuestionPool pool =
            await repository.GetAsync(cancellationToken) ?? ModelParameterDefaults.QuestionPool();

        return new GetQuestionPoolResponse(ModelParameterMappings.ToDto(pool));
    }
}
