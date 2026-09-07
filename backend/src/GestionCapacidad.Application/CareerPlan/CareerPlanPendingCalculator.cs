using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.CareerPlan;

/// <summary>
/// Lo que quedó pendiente de gestionar en el chapter: puerto literal de la
/// sección de pendientes de <c>buildSpanSummary</c>. Se calcula una sola vez
/// sobre el span ya armado, sin pedir el plan de cada persona por separado.
/// </summary>
public static class CareerPlanPendingCalculator
{
    public static SpanPendingDto Compute(
        SpanMatrixDto span, IReadOnlyList<Skill> activeSkills, IReadOnlyList<PlanAction> actions, DateOnly today)
    {
        int unassessed = span.People.Count(p => !p.Evaluated);

        string currentMonth = $"{today.Year:D4}-{today.Month:D2}";
        int overduePlans = actions.Count(a =>
            a.Status == PlanActionStatus.InProgress && string.CompareOrdinal(a.DueMonth, currentMonth) < 0);

        List<string> positions = [.. span.People.Select(p => p.Position).Distinct()];
        int positionsWithoutLevel = positions.Count(position => activeSkills.Any(s =>
            s.Expectations.FirstOrDefault(e => string.Equals(e.Position, position, StringComparison.Ordinal))?.Level.Value is null));

        int gapsWithoutPlan = 0;
        foreach (SpanPersonDto person in span.People)
        {
            if (!person.Evaluated)
            {
                continue;
            }

            foreach (SpanCellDto cell in person.Cells.Where(c => c.Gap is > 0m))
            {
                bool hasPlan = actions.Any(a =>
                    a.PersonId == person.PersonId && a.SkillId == cell.SkillId && a.Status == PlanActionStatus.InProgress);
                if (!hasPlan)
                {
                    gapsWithoutPlan++;
                }
            }
        }

        return new SpanPendingDto(unassessed, overduePlans, positionsWithoutLevel, gapsWithoutPlan);
    }
}
