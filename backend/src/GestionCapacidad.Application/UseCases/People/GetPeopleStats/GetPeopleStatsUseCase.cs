using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.People.GetPeopleStats;

public sealed class GetPeopleStatsUseCase(IPersonRepository personRepository)
    : IUseCase<GetPeopleStatsResponse>
{
    /// <summary>
    /// Capacidad objetivo asumida — su cálculo real (por chapter, contratado,
    /// etc.) es responsabilidad de un ajuste posterior, igual que en el mock.
    /// </summary>
    private const float AssumedFteTarget = 12f;

    private const int SampleSize = 5;

    public async Task<GetPeopleStatsResponse> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);

        var bySeniority = Seniority.ValidValues
            .Select(s => new SeniorityBucketDto(
                s.Value,
                s.Label,
                people.Count(p => p.Seniority == s)))
            .ToList();

        var sample = people
            .OrderBy(p => p.Name, StringComparer.Ordinal)
            .Take(SampleSize)
            .Select(p => new PersonRefDto(p.Id, p.Name))
            .ToList();

        var stats = new PeopleStatsDto(
            people.Count,
            people.Sum(p => p.AvailableFte.Value),
            AssumedFteTarget,
            bySeniority,
            sample,
            ComputeStackCoverage(people));

        return new GetPeopleStatsResponse(stats);
    }

    private static StackCoverageDto ComputeStackCoverage(IReadOnlyList<Person> people)
    {
        var counts = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (Person person in people)
        {
            foreach (PersonStack stack in person.Stacks)
            {
                counts[stack.Name] = counts.GetValueOrDefault(stack.Name) + 1;
            }
        }

        return new StackCoverageDto(
            counts.Count,
            counts.Where(kv => kv.Value == 1)
                .Select(kv => kv.Key)
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToList());
    }
}
