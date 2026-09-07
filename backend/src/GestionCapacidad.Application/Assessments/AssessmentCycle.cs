using System.Text.RegularExpressions;

namespace GestionCapacidad.Application.Assessments;

/// <summary>
/// El ciclo semestral (<c>YYYY-S1</c> enero-junio, <c>YYYY-S2</c>
/// julio-diciembre) contra el que se evalúa. Espejo de <c>currentCycle</c>
/// del frontend.
/// </summary>
public static partial class AssessmentCycle
{
    public static string Current(TimeProvider timeProvider)
    {
        DateTime now = timeProvider.GetUtcNow().UtcDateTime;
        int half = now.Month <= 6 ? 1 : 2;
        return $"{now.Year}-S{half}";
    }

    public static bool IsValidFormat(string? cycle) => cycle is not null && CyclePattern().IsMatch(cycle);

    [GeneratedRegex(@"^\d{4}-S[12]$")]
    private static partial Regex CyclePattern();
}
