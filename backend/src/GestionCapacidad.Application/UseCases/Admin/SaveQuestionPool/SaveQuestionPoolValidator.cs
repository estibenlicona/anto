using FluentValidation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;

public sealed class SaveQuestionPoolValidator : AbstractValidator<SaveQuestionPoolRequest>
{
    public SaveQuestionPoolValidator()
    {
        RuleFor(r => r.Questions)
            .NotNull()
            .WithMessage("El pool de preguntas es obligatorio.");

        RuleForEach(r => r.Questions)
            .ChildRules(question =>
            {
                question.RuleFor(q => q.Id)
                    .NotEmpty()
                    .WithMessage("El id de la pregunta es obligatorio.")
                    .MaximumLength(50)
                    .WithMessage("El id de la pregunta no puede superar 50 caracteres.");

                question.RuleFor(q => q.Dimension)
                    .Must(BeAKnownDimension)
                    .WithMessage(q => $"La dimensión de la pregunta {q.Id} no existe.");

                question.RuleFor(q => q.Texto)
                    .NotEmpty()
                    .WithMessage(q => $"El texto de la pregunta {q.Id} es obligatorio.")
                    .MaximumLength(500)
                    .WithMessage("El texto de la pregunta no puede superar 500 caracteres.");

                question.RuleFor(q => q.Peso)
                    .GreaterThanOrEqualTo(1)
                    .WithMessage(q => $"El peso de la pregunta {q.Id} debe ser un entero mayor o igual a 1.");
            })
            .When(r => r.Questions is not null);

        RuleFor(r => r.Questions)
            .Must(HaveUniqueCodes)
            .WithMessage(RepeatedCodeMessage)
            .When(r => r.Questions is not null);
    }

    private static bool BeAKnownDimension(string dimension) =>
        QuestionDimension.ValidValues.Any(d => string.Equals(d.Value, dimension, StringComparison.Ordinal));

    private static bool HaveUniqueCodes(IReadOnlyList<DataTransferObjects.QuestionPoolRowDto> questions)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        return questions.All(q => string.IsNullOrWhiteSpace(q.Id) || seen.Add(q.Id));
    }

    private static string RepeatedCodeMessage(SaveQuestionPoolRequest request)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        string? repeated = request.Questions
            .Select(q => q.Id)
            .FirstOrDefault(id => !string.IsNullOrWhiteSpace(id) && !seen.Add(id));

        return $"El id de la pregunta se repite: {repeated}.";
    }
}
