using FluentValidation;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;

public sealed class SaveCapabilityMixValidator : AbstractValidator<SaveCapabilityMixRequest>
{
    public SaveCapabilityMixValidator()
    {
        RuleFor(r => r.Rows)
            .NotNull()
            .WithMessage("El mix de capacidades es obligatorio.");

        RuleForEach(r => r.Rows)
            .ChildRules(row =>
            {
                row.RuleFor(r => r.Id)
                    .NotEmpty()
                    .WithMessage("El id de la capacidad es obligatorio.")
                    .MaximumLength(50)
                    .WithMessage("El id de la capacidad no puede superar 50 caracteres.");

                row.RuleFor(r => r.Capacidad)
                    .NotEmpty()
                    .WithMessage("El nombre de la capacidad es obligatorio.")
                    .MaximumLength(100)
                    .WithMessage("El nombre de la capacidad no puede superar 100 caracteres.");

                row.RuleFor(r => r.PorTalla)
                    .NotNull()
                    .WithMessage(r => $"La capacidad {r.Capacidad} debe traer sus cantidades por talla.");

                row.RuleFor(r => r.PorTalla)
                    .Must(porTalla => porTalla.Values.All(amount => amount >= 0))
                    .WithMessage(NegativeAmountMessage)
                    .When(r => r.PorTalla is not null);
            })
            .When(r => r.Rows is not null);

        RuleFor(r => r.Rows)
            .Must(rows => AreUnique(rows.Select(r => r.Id), StringComparer.Ordinal))
            .WithMessage(rows => RepeatedMessage(
                "El id de la capacidad se repite",
                rows.Rows.Select(r => r.Id),
                StringComparer.Ordinal))
            .When(r => r.Rows is not null);

        // Dos filas llamadas "QA Engineer" y "qa engineer" son la misma
        // capacidad escrita de dos formas: la pantalla no podría distinguirlas.
        RuleFor(r => r.Rows)
            .Must(rows => AreUnique(
                rows.Select(r => r.Capacidad?.Trim() ?? string.Empty), StringComparer.OrdinalIgnoreCase))
            .WithMessage(rows => RepeatedMessage(
                "El nombre de la capacidad se repite",
                rows.Rows.Select(r => r.Capacidad?.Trim() ?? string.Empty),
                StringComparer.OrdinalIgnoreCase))
            .When(r => r.Rows is not null);
    }

    private static string NegativeAmountMessage(CapabilityMixRowDto row)
    {
        KeyValuePair<string, int> offending = row.PorTalla.First(pair => pair.Value < 0);
        return $"La cantidad de {row.Capacidad} para la talla {offending.Key} debe ser un entero mayor o igual a 0.";
    }

    private static bool AreUnique(IEnumerable<string> values, StringComparer comparer)
    {
        var seen = new HashSet<string>(comparer);
        return values.All(value => string.IsNullOrWhiteSpace(value) || seen.Add(value));
    }

    private static string RepeatedMessage(string prefix, IEnumerable<string> values, StringComparer comparer)
    {
        var seen = new HashSet<string>(comparer);
        string? repeated = values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v) && !seen.Add(v));
        return $"{prefix}: {repeated}.";
    }
}
