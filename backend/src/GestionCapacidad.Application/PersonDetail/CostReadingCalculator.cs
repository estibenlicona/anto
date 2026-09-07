using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.PersonDetail;

/// <summary>Cómo se lee el costo mensual de una persona contra la banda de su nivel. Puerto literal del mock — bandas fijas, sin endpoint que las edite.</summary>
public static class CostReadingCalculator
{
    private static readonly IReadOnlyDictionary<int, (decimal Min, decimal Max)> Bands = new Dictionary<int, (decimal, decimal)>
    {
        [1] = (4_000_000m, 6_500_000m),
        [2] = (5_500_000m, 8_500_000m),
        [3] = (7_000_000m, 11_000_000m),
        [4] = (9_000_000m, 15_000_000m),
    };

    public static CostReading Compute(int level, decimal monthlyCost)
    {
        if (!Bands.TryGetValue(level, out (decimal Min, decimal Max) band))
        {
            return CostReading.InRange;
        }

        if (monthlyCost > band.Max)
        {
            return CostReading.High;
        }

        if (monthlyCost < band.Min)
        {
            return CostReading.Low;
        }

        return CostReading.InRange;
    }
}
