using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class InitiativeTests
{
    private static readonly Guid SquadId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    private static Initiative Create(int targetMonths = 6) =>
        new("Kafka Migration", SquadId, "Paola Henao", targetMonths);

    private static InitiativeEvaluation Evaluation(int targetMonths = 6, string talla = "M") => new(
        Triage: [true, false, false, true, false, false],
        Answers: new Dictionary<string, int> { ["N1"] = 2 },
        TargetMonths: targetMonths,
        Points: 126m, MaxPoints: 280m, Pct: 45m,
        Talla: talla, PmMin: 3m, PmMax: 6m,
        FteExpected: 0.75m, FteMin: 0.5m, FteMax: 1m,
        Dimensions: [],
        Mix: [],
        TriageVerdict: TriageVerdict.Recommended,
        SavedAtUtc: new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc));

    // ── Constructor ───────────────────────────────────────────────────────────

    [Fact]
    public void Create_StartsEvaluatingWithoutEvaluation()
    {
        Initiative initiative = Create();

        Assert.Equal("Kafka Migration", initiative.Name);
        Assert.Equal(SquadId, initiative.SquadId);
        Assert.Equal("Paola Henao", initiative.ProductOwner);
        Assert.Equal(6, initiative.TargetMonths);
        Assert.Equal(InitiativeStatus.Evaluating, initiative.Status);
        Assert.Null(initiative.Evaluation);
    }

    [Fact]
    public void Create_TrimsNameAndProductOwner()
    {
        var initiative = new Initiative("  Kafka  ", SquadId, "  Paola  ", 6);

        Assert.Equal("Kafka", initiative.Name);
        Assert.Equal("Paola", initiative.ProductOwner);
    }

    [Fact]
    public void Create_WithEmptySquad_Throws()
    {
        Assert.Throws<DomainException>(() => new Initiative("Kafka", Guid.Empty, "Paola", 6));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankName_Throws(string name)
    {
        Assert.Throws<DomainException>(() => new Initiative(name, SquadId, "Paola", 6));
    }

    [Fact]
    public void Create_WithNameOver200_Throws()
    {
        Assert.Throws<DomainException>(() => new Initiative(new string('A', 201), SquadId, "Paola", 6));
    }

    [Fact]
    public void Create_WithProductOwnerOver100_Throws()
    {
        Assert.Throws<DomainException>(() => new Initiative("Kafka", SquadId, new string('A', 101), 6));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(37)]
    public void Create_WithTargetMonthsOutOfRange_Throws(int months)
    {
        var exception = Assert.Throws<DomainException>(() => new Initiative("Kafka", SquadId, "Paola", months));

        Assert.Contains("plazo", exception.Message);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(36)]
    public void Create_WithTargetMonthsAtTheBounds_Accepts(int months)
    {
        Assert.Equal(months, Create(months).TargetMonths);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    [Fact]
    public void Update_ReplacesEditableFields()
    {
        Initiative initiative = Create();
        Guid otherSquad = Guid.Parse("33333333-3333-3333-3333-333333333333");

        initiative.Update("Kafka Migration v2", otherSquad, "Ana Restrepo", 9);

        Assert.Equal("Kafka Migration v2", initiative.Name);
        Assert.Equal(otherSquad, initiative.SquadId);
        Assert.Equal("Ana Restrepo", initiative.ProductOwner);
        Assert.Equal(9, initiative.TargetMonths);
        Assert.NotNull(initiative.UpdatedAtUtc);
    }

    [Fact]
    public void Update_DoesNotDropTheStoredEvaluation()
    {
        Initiative initiative = Create();
        initiative.SaveEvaluation(Evaluation());

        initiative.Update("Otro nombre", SquadId, "Paola Henao", 9);

        Assert.NotNull(initiative.Evaluation);
        Assert.Equal("M", initiative.Evaluation.Talla);
    }

    [Fact]
    public void Update_WithInvalidTargetMonths_Throws()
    {
        Initiative initiative = Create();

        Assert.Throws<DomainException>(() => initiative.Update("Kafka", SquadId, "Paola", 0));
    }

    // ── Evaluación ────────────────────────────────────────────────────────────

    [Fact]
    public void SaveEvaluation_StoresTheSnapshotAndAlignsTargetMonths()
    {
        Initiative initiative = Create(targetMonths: 6);

        initiative.SaveEvaluation(Evaluation(targetMonths: 9));

        Assert.NotNull(initiative.Evaluation);
        Assert.Equal(9, initiative.TargetMonths);
        Assert.Equal(TriageVerdict.Recommended, initiative.Evaluation.TriageVerdict);
    }

    [Fact]
    public void SaveEvaluation_ReplacesAPreviousOne()
    {
        Initiative initiative = Create();
        initiative.SaveEvaluation(Evaluation(talla: "M"));

        initiative.SaveEvaluation(Evaluation(talla: "L"));

        Assert.Equal("L", initiative.Evaluation!.Talla);
    }

    // ── Estado ────────────────────────────────────────────────────────────────

    [Fact]
    public void ChangeStatus_ToActiveWithoutEvaluation_Throws()
    {
        Initiative initiative = Create();

        var exception = Assert.Throws<DomainException>(() =>
            initiative.ChangeStatus(InitiativeStatus.Active));

        Assert.Equal("Para activar una iniciativa primero hay que evaluarla", exception.Message);
        Assert.Equal(InitiativeStatus.Evaluating, initiative.Status);
    }

    [Fact]
    public void ChangeStatus_ToActiveWithEvaluation_Succeeds()
    {
        Initiative initiative = Create();
        initiative.SaveEvaluation(Evaluation());

        initiative.ChangeStatus(InitiativeStatus.Active);

        Assert.Equal(InitiativeStatus.Active, initiative.Status);
    }

    [Fact]
    public void ChangeStatus_ToClosedFromEvaluating_Throws()
    {
        Initiative initiative = Create();

        var exception = Assert.Throws<DomainException>(() =>
            initiative.ChangeStatus(InitiativeStatus.Closed));

        Assert.Equal("Sólo se cierra una iniciativa activa", exception.Message);
    }

    [Fact]
    public void ChangeStatus_ToClosedFromActive_Succeeds()
    {
        Initiative initiative = Create();
        initiative.SaveEvaluation(Evaluation());
        initiative.ChangeStatus(InitiativeStatus.Active);

        initiative.ChangeStatus(InitiativeStatus.Closed);

        Assert.Equal(InitiativeStatus.Closed, initiative.Status);
    }

    [Fact]
    public void ChangeStatus_ToTheSameStatus_IsANoOpAndSkipsTheGuards()
    {
        Initiative initiative = Create();

        initiative.ChangeStatus(InitiativeStatus.Evaluating);

        Assert.Equal(InitiativeStatus.Evaluating, initiative.Status);
        Assert.Null(initiative.UpdatedAtUtc);
    }

    [Fact]
    public void ChangeStatus_RaisesTheStatusChangedEvent()
    {
        Initiative initiative = Create();
        initiative.SaveEvaluation(Evaluation());

        initiative.ChangeStatus(InitiativeStatus.Active);

        Assert.Contains(initiative.DomainEvents, e => e is InitiativeStatusChangedEvent);
    }
}
