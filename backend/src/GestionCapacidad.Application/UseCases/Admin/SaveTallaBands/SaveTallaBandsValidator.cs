using FluentValidation;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;

public sealed class SaveTallaBandsValidator : AbstractValidator<SaveTallaBandsRequest>
{
    public SaveTallaBandsValidator()
    {
        RuleFor(r => r.Boundaries)
            .NotNull()
            .Must(b => b is not null && b.Count == TallaBandSet.BoundaryCount)
            .WithMessage($"Deben enviarse exactamente {TallaBandSet.BoundaryCount} cortes de porcentaje.");

        RuleFor(r => r.Bands)
            .NotNull()
            .Must(b => b is not null && b.Count == TallaBandSet.BandCount)
            .WithMessage($"Deben enviarse exactamente {TallaBandSet.BandCount} bandas de talla.");

        // Los cortes reparten el rango: crecientes y sin dejar ninguna banda
        // por debajo del ancho mínimo, tampoco contra 0 y 100.
        RuleFor(r => r.Boundaries)
            .Must(BePartitionOfTheRange)
            .WithMessage(
                $"Los cortes deben ser crecientes y dejar al menos {TallaBandSet.MinBandWidth:0.##} puntos " +
                $"entre bandas y contra {TallaBandSet.RangeMin:0.##} y {TallaBandSet.RangeMax:0.##}.")
            .When(r => r.Boundaries is { Count: TallaBandSet.BoundaryCount });

        RuleForEach(r => r.Bands)
            .ChildRules(band =>
            {
                band.RuleFor(b => b.Talla)
                    .NotEmpty()
                    .WithMessage("La talla de la banda es obligatoria.")
                    .MaximumLength(10)
                    .WithMessage("La talla no puede superar 10 caracteres.");

                band.RuleFor(b => b.Lectura)
                    .NotEmpty()
                    .WithMessage("La lectura de la banda es obligatoria.")
                    .MaximumLength(200)
                    .WithMessage("La lectura no puede superar 200 caracteres.");

                band.RuleFor(b => b.PmMin)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage(b => $"El persona-mes mínimo de la talla {b.Talla} no puede ser negativo.");

                band.RuleFor(b => b.PmMin)
                    .LessThanOrEqualTo(b => b.PmMax)
                    .WithMessage(b => $"El persona-mes mínimo de la talla {b.Talla} no puede superar su máximo.");
            })
            .When(r => r.Bands is not null);

        RuleFor(r => r.Bands)
            .Must(HaveUniqueTallas)
            .WithMessage(RepeatedTallaMessage)
            .When(r => r.Bands is not null);
    }

    private static bool BePartitionOfTheRange(IReadOnlyList<decimal> boundaries)
    {
        decimal previous = TallaBandSet.RangeMin;
        for (int i = 0; i < boundaries.Count; i++)
        {
            decimal boundary = boundaries[i];
            decimal next = i == boundaries.Count - 1 ? TallaBandSet.RangeMax : boundaries[i + 1];

            if (boundary - previous < TallaBandSet.MinBandWidth ||
                next - boundary < TallaBandSet.MinBandWidth)
            {
                return false;
            }

            previous = boundary;
        }

        return true;
    }

    private static bool HaveUniqueTallas(IReadOnlyList<TallaBandDto> bands)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        return bands.All(b => string.IsNullOrWhiteSpace(b.Talla) || seen.Add(b.Talla.Trim()));
    }

    private static string RepeatedTallaMessage(SaveTallaBandsRequest request)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        string? repeated = request.Bands
            .Select(b => b.Talla?.Trim())
            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t) && !seen.Add(t!));

        return $"La talla se repite: {repeated}.";
    }
}
