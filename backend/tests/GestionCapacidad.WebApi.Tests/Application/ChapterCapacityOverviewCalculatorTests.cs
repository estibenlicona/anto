using GestionCapacidad.Application.ControlTower;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ChapterCapacityOverviewCalculatorTests
{
    [Fact]
    public void PersonFullyAllocated_DoesNotAppearInPeople()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person full = TestDataFactory.CreatePerson(name: "Al 100%");
        var allocation = new Allocation(full.Id, squad.Id, null, Percentage.From(100), Percentage.From(50), Percentage.From(50));

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute([full], [squad], [allocation], []);

        Assert.Empty(overview.People);
        Assert.Equal(0, overview.PeopleUnassigned);
        Assert.Equal(0, overview.PeoplePartial);
    }

    [Fact]
    public void SquadWithoutTeam_IsNotCountedAsAtCapacity()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Pagos Instantáneos");

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute([], [squad], [], []);

        Assert.Equal(0, overview.SquadsAtCapacity);
        Assert.Equal(1, overview.SquadsWithoutTeam);
    }

    [Fact]
    public void ChapterWithoutPeople_RespondsZeroesWithoutThrowing()
    {
        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute([], [], [], []);

        Assert.Equal(0, overview.ChapterFte);
        Assert.Equal(0, overview.BauFte);
        Assert.Equal(0, overview.FreeFte);
        Assert.Equal(0, overview.PeopleTotal);
        Assert.Empty(overview.People);
        Assert.Empty(overview.Squads);
    }

    [Fact]
    public void EveryoneFullyAllocated_PeopleIsEmpty()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person a = TestDataFactory.CreatePerson(name: "A");
        Person b = TestDataFactory.CreatePerson(name: "B");
        var allocA = new Allocation(a.Id, squad.Id, null, Percentage.From(100), Percentage.From(100), Percentage.Zero);
        var allocB = new Allocation(b.Id, squad.Id, null, Percentage.From(100), Percentage.From(100), Percentage.Zero);

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute([a, b], [squad], [allocA, allocB], []);

        Assert.Empty(overview.People);
    }

    [Fact]
    public void OverAllocatedChapter_FreeFteIsNegative_NotClampedToZero()
    {
        // Persona part-time (0.5 FTE) asignada al 100 % de dedicación: el
        // asignado no mira el disponible de la persona (misma asimetría de FteMath).
        Person partTime = TestDataFactory.CreatePerson(name: "Part-time");
        partTime.UpdateAvailability(Fte.From(0.5f));
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        var allocation = new Allocation(partTime.Id, squad.Id, null, Percentage.From(100), Percentage.From(100), Percentage.Zero);

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute([partTime], [squad], [allocation], []);

        Assert.True(overview.FreeFte < 0);
    }

    [Fact]
    public void PeopleWithMargin_UnassignedFirstThenByDescendingMargin()
    {
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform");
        Person unassigned = TestDataFactory.CreatePerson(name: "Sin Célula");
        Person mostlyFree = TestDataFactory.CreatePerson(name: "Mucho Margen");
        Person barelyFree = TestDataFactory.CreatePerson(name: "Poco Margen");
        var allocMostlyFree = new Allocation(mostlyFree.Id, squad.Id, null, Percentage.From(20), Percentage.From(20), Percentage.Zero);
        var allocBarelyFree = new Allocation(barelyFree.Id, squad.Id, null, Percentage.From(90), Percentage.From(90), Percentage.Zero);

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute(
            [unassigned, mostlyFree, barelyFree], [squad], [allocMostlyFree, allocBarelyFree], []);

        Assert.Equal(["Sin Célula", "Mucho Margen", "Poco Margen"], overview.People.Select(p => p.Name));
    }

    [Fact]
    public void SquadsOrder_WithoutTeamFirst_ThenAtCapacity_ThenByLowestMargin()
    {
        Squad withoutTeam = TestDataFactory.CreateSquad(name: "Sin Equipo");
        Squad atCapacity = TestDataFactory.CreateSquad(name: "Al Tope");
        Squad lowMargin = TestDataFactory.CreateSquad(name: "Poco Margen");
        Squad highMargin = TestDataFactory.CreateSquad(name: "Mucho Margen");

        Person p1 = TestDataFactory.CreatePerson(name: "P1");
        Person p2 = TestDataFactory.CreatePerson(name: "P2");
        Person p3 = TestDataFactory.CreatePerson(name: "P3");

        var atCapacityAlloc = new Allocation(p1.Id, atCapacity.Id, null, Percentage.From(100), Percentage.From(100), Percentage.Zero);
        var lowMarginAlloc = new Allocation(p2.Id, lowMargin.Id, null, Percentage.From(90), Percentage.From(90), Percentage.Zero);
        var highMarginAlloc = new Allocation(p3.Id, highMargin.Id, null, Percentage.From(20), Percentage.From(20), Percentage.Zero);

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute(
            [p1, p2, p3], [withoutTeam, atCapacity, lowMargin, highMargin],
            [atCapacityAlloc, lowMarginAlloc, highMarginAlloc], []);

        Assert.Equal(
            ["Sin Equipo", "Al Tope", "Poco Margen", "Mucho Margen"],
            overview.Squads.Select(s => s.Name));
    }

    [Fact]
    public void SquadsTie_MathematicallyEqualMargins_BreakByNameDespiteFloatingPointNoise()
    {
        // 2.0 - 1.6 y 1.0 - 0.6 dan el mismo margen (0.4) pero difieren en un
        // épsilon binario: el orden no puede depender de esa diferencia.
        Squad fraude = TestDataFactory.CreateSquad(name: "Fraude Tarjetas");
        Squad plataforma = TestDataFactory.CreateSquad(name: "Plataforma de Datos");
        Person a = TestDataFactory.CreatePerson(name: "A");
        Person b = TestDataFactory.CreatePerson(name: "B");
        Person c = TestDataFactory.CreatePerson(name: "C");
        Person d = TestDataFactory.CreatePerson(name: "D");
        var allocA = new Allocation(a.Id, fraude.Id, null, Percentage.From(60), Percentage.From(60), Percentage.Zero);
        var allocB = new Allocation(b.Id, plataforma.Id, null, Percentage.From(80), Percentage.From(80), Percentage.Zero);
        var allocC = new Allocation(c.Id, plataforma.Id, null, Percentage.From(80), Percentage.From(80), Percentage.Zero);

        CapacityOverviewDto overview = ChapterCapacityOverviewCalculator.Compute(
            [a, b, c, d], [fraude, plataforma], [allocA, allocB, allocC], []);

        Assert.Equal(["Fraude Tarjetas", "Plataforma de Datos"], overview.Squads.Select(s => s.Name));
    }
}
