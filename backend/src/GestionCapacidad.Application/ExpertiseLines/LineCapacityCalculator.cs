using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.ExpertiseLines;

/// <summary>
/// La capacidad de una línea: mismas fórmulas de <see cref="FteMath"/> que ya
/// usan Células y Torre de control, con una diferencia deliberada — acá el
/// FTE libre se acota a 0 (literal del spec de esta capability, no de
/// Torre de control).
/// </summary>
public static class LineCapacityCalculator
{
    public static LineCapacityDto Compute(IReadOnlyList<Person> linePeople, IReadOnlyDictionary<Guid, Allocation> allocationByPerson)
    {
        double availableFte = FteMath.AvailableFteOf(linePeople.Select(p => p.AvailableFte.Value));
        double allocatedFte = FteMath.FteOfPercentages(
            linePeople.Select(p => allocationByPerson.GetValueOrDefault(p.Id)?.DedicationPercentage.Value ?? 0));
        double freeFte = Math.Max(0, FteMath.Round1(availableFte - allocatedFte));
        double unallocatedPercentage = availableFte <= 0
            ? 0
            : FteMath.Round1(freeFte / availableFte * 100);

        return new LineCapacityDto(linePeople.Count, availableFte, allocatedFte, freeFte, unallocatedPercentage);
    }
}
