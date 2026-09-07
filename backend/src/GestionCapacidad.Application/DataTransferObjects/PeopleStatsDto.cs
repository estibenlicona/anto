namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// Resumen del equipo sobre el total (sin paginar): cuántas personas hay, el
/// FTE disponible frente al objetivo, la distribución por seniority (los tres
/// escalones siempre presentes, aunque estén en cero), una muestra para los
/// avatares y la cobertura de stacks.
/// </summary>
public sealed record PeopleStatsDto(
    int ActiveCount,
    float FteAvailable,
    float FteTarget,
    IReadOnlyCollection<SeniorityBucketDto> BySeniority,
    IReadOnlyCollection<PersonRefDto> Sample,
    StackCoverageDto StackCoverage);

public sealed record SeniorityBucketDto(string Seniority, string Label, int Count);

public sealed record PersonRefDto(Guid Id, string Name);

/// <summary>Cuántos stacks distintos hay y cuáles tiene una sola persona (bus factor 1).</summary>
public sealed record StackCoverageDto(int Distinct, IReadOnlyCollection<string> AtRisk);
