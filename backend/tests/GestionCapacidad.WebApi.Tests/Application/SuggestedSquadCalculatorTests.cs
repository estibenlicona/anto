using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.PersonDetail;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SuggestedSquadCalculatorTests
{
    [Fact]
    public void EmptySquad_SuggestsWithSinEquipoReason()
    {
        Person backendDev = TestDataFactory.CreatePerson(name: "Sin Célula", position: "Backend Dev");
        Squad pagos = TestDataFactory.CreateSquad(name: "Pagos Instantáneos");

        IReadOnlyList<SuggestedSquadDto> suggestions = SuggestedSquadCalculator.Compute(
            backendDev, [pagos], [], new Dictionary<Guid, Person> { [backendDev.Id] = backendDev });

        SuggestedSquadDto suggestion = Assert.Single(suggestions);
        Assert.Equal("Sin equipo", suggestion.Reason);
        Assert.Equal(3, suggestion.RequiredLevel);
    }

    [Fact]
    public void PositionAlreadyCoveredInTeam_DoesNotSuggestThatSquad()
    {
        Person candidate = TestDataFactory.CreatePerson(name: "Candidato", position: "Backend Dev");
        Person incumbent = TestDataFactory.CreatePerson(name: "Titular", position: "Backend Dev");
        Squad pagos = TestDataFactory.CreateSquad(name: "Pagos Instantáneos");
        var allocation = new Allocation(incumbent.Id, pagos.Id, null, Percentage.From(100), Percentage.From(50), Percentage.From(50));

        IReadOnlyList<SuggestedSquadDto> suggestions = SuggestedSquadCalculator.Compute(
            candidate, [pagos], [allocation],
            new Dictionary<Guid, Person> { [candidate.Id] = candidate, [incumbent.Id] = incumbent });

        Assert.Empty(suggestions);
    }

    [Fact]
    public void SquadWithTeamButDifferentPosition_SuggestsWithMissingPositionReason()
    {
        Person candidate = TestDataFactory.CreatePerson(name: "Candidato", position: "Backend Dev");
        Person owner = TestDataFactory.CreatePerson(name: "Dueño", position: "Product Owner");
        Squad pagos = TestDataFactory.CreateSquad(name: "Pagos Instantáneos");
        var allocation = new Allocation(owner.Id, pagos.Id, null, Percentage.From(100), Percentage.From(50), Percentage.From(50));

        IReadOnlyList<SuggestedSquadDto> suggestions = SuggestedSquadCalculator.Compute(
            candidate, [pagos], [allocation],
            new Dictionary<Guid, Person> { [candidate.Id] = candidate, [owner.Id] = owner });

        SuggestedSquadDto suggestion = Assert.Single(suggestions);
        Assert.Equal("Sin Backend Dev en el equipo", suggestion.Reason);
    }

    [Fact]
    public void SquadNotInTheWantedTable_NeverSuggested()
    {
        Person backendDev = TestDataFactory.CreatePerson(name: "Sin Célula", position: "Backend Dev");
        Squad backendPlatform = TestDataFactory.CreateSquad(name: "Backend Platform");

        IReadOnlyList<SuggestedSquadDto> suggestions = SuggestedSquadCalculator.Compute(
            backendDev, [backendPlatform], [], new Dictionary<Guid, Person> { [backendDev.Id] = backendDev });

        Assert.Empty(suggestions);
    }
}
