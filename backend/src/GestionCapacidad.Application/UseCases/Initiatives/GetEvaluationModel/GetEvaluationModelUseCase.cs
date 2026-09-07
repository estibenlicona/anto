using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetEvaluationModel;

public sealed record GetEvaluationModelResponse(EvaluationModelDto Model);

/// <summary>
/// El modelo vigente, para que la pantalla pinte el formulario y calcule la
/// vista en vivo con lo mismo que el servidor usará al guardar.
/// </summary>
public sealed class GetEvaluationModelUseCase(IEvaluationModelProvider modelProvider)
    : IUseCase<GetEvaluationModelResponse>
{
    public async Task<GetEvaluationModelResponse> ExecuteAsync(CancellationToken cancellationToken = default) =>
        new(await modelProvider.GetAsync(cancellationToken));
}
