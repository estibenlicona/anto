using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;

/// <summary>
/// El cuerpo del <c>PUT /admin/question-pool</c>. El contrato manda un
/// arreglo desnudo; el endpoint lo envuelve acá porque FluentValidation
/// valida un objeto raíz.
/// </summary>
public sealed record SaveQuestionPoolRequest(IReadOnlyList<QuestionPoolRowDto> Questions);
