using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class AbsenceTypeTests
{
    [Theory]
    [InlineData("Vacation", "Vacaciones")]
    [InlineData("Leave", "Permiso")]
    [InlineData("SickLeave", "Incapacidad")]
    public void From_WithValidSlug_ReturnsTypeWithSpanishLabel(string value, string label)
    {
        AbsenceType type = AbsenceType.From(value);

        Assert.Equal(value, type.Value);
        Assert.Equal(label, type.Label);
    }

    [Fact]
    public void ValidValues_AreTheThreeOfTheContract_InOrder()
    {
        Assert.Equal(["Vacation", "Leave", "SickLeave"], AbsenceType.ValidValues.Select(t => t.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("vacation")]
    [InlineData("Holiday")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => AbsenceType.From(value));

        Assert.Contains("Vacation", exception.Message);
        Assert.Contains("SickLeave", exception.Message);
    }
}

public sealed class AbsenceStatusTests
{
    [Theory]
    [InlineData("Requested", "Solicitada")]
    [InlineData("Approved", "Aprobada")]
    [InlineData("Rejected", "Rechazada")]
    public void From_WithValidSlug_ReturnsStatusWithSpanishLabel(string value, string label)
    {
        AbsenceStatus status = AbsenceStatus.From(value);

        Assert.Equal(value, status.Value);
        Assert.Equal(label, status.Label);
    }

    [Fact]
    public void ValidValues_AreTheThreeOfTheContract_InOrder()
    {
        Assert.Equal(["Requested", "Approved", "Rejected"], AbsenceStatus.ValidValues.Select(s => s.Value));
    }

    [Fact]
    public void IsApproved_IsTrueOnlyForApproved()
    {
        Assert.True(AbsenceStatus.Approved.IsApproved);
        Assert.False(AbsenceStatus.Requested.IsApproved);
        Assert.False(AbsenceStatus.Rejected.IsApproved);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Pending")]
    public void From_WithInvalidValue_Throws(string value)
    {
        Assert.Throws<DomainException>(() => AbsenceStatus.From(value));
    }
}

public sealed class AbsenceTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    // Semana del 5 al 9 de octubre de 2026: lunes a viernes.
    private static readonly DateOnly Monday = new(2026, 10, 5);
    private static readonly DateOnly Wednesday = new(2026, 10, 7);
    private static readonly DateOnly Saturday = new(2026, 10, 10);
    private static readonly DateOnly Sunday = new(2026, 10, 11);

    private static Absence Create(
        AbsenceType? type = null,
        DateOnly? start = null,
        DateOnly? end = null,
        bool halfDay = false) =>
        new(PersonId,
            type ?? AbsenceType.Vacation,
            start ?? Monday,
            end ?? Wednesday,
            halfDay,
            halfDay);

    // ── Constructor ───────────────────────────────────────────────────────────

    [Fact]
    public void Create_StartsRequestedWithoutReason()
    {
        Absence absence = Create();

        Assert.Equal(PersonId, absence.PersonId);
        Assert.Equal(AbsenceType.Vacation, absence.Type);
        Assert.Equal(Monday, absence.StartDate);
        Assert.Equal(Wednesday, absence.EndDate);
        Assert.Equal(AbsenceStatus.Requested, absence.Status);
        Assert.Null(absence.RejectReason);
    }

    [Fact]
    public void Create_WithEmptyPerson_Throws()
    {
        Assert.Throws<DomainException>(() =>
            new Absence(Guid.Empty, AbsenceType.Vacation, Monday, Wednesday, false, false));
    }

    [Fact]
    public void Create_WithEndBeforeStart_Throws()
    {
        var exception = Assert.Throws<DomainException>(() => Create(start: Wednesday, end: Monday));

        Assert.Equal("El rango de fechas es inválido", exception.Message);
    }

    [Fact]
    public void Create_OverASingleDay_IsAValidRange()
    {
        Absence absence = Create(start: Monday, end: Monday);

        Assert.Equal(Monday, absence.StartDate);
        Assert.Equal(Monday, absence.EndDate);
    }

    [Fact]
    public void Create_OverAWeekendOnly_Throws()
    {
        // Un día que no se trabaja no descuenta nada, así que pedirlo no
        // significa nada.
        var exception = Assert.Throws<DomainException>(() => Create(start: Saturday, end: Sunday));

        Assert.Equal("El rango no tiene días hábiles", exception.Message);
    }

    [Fact]
    public void Create_OverASaturdayAlone_Throws()
    {
        Assert.Throws<DomainException>(() =>
            Create(type: AbsenceType.Leave, start: Saturday, end: Saturday));
    }

    [Fact]
    public void Create_SpanningAWeekend_IsValidBecauseItHasBusinessDays()
    {
        Absence absence = Create(start: new DateOnly(2026, 10, 9), end: new DateOnly(2026, 10, 12));

        Assert.Equal(new DateOnly(2026, 10, 9), absence.StartDate);
    }

    // ── Media jornada ─────────────────────────────────────────────────────────

    [Fact]
    public void Create_HalfDayLeaveOverOneDay_IsValid()
    {
        Absence absence = Create(type: AbsenceType.Leave, start: Monday, end: Monday, halfDay: true);

        Assert.True(absence.StartsHalfDay);
        Assert.True(absence.EndsHalfDay);
    }

    [Fact]
    public void Create_WithMismatchedHalfDayFlags_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new Absence(PersonId, AbsenceType.Leave, Monday, Monday, startsHalfDay: true, endsHalfDay: false));

        Assert.Equal("El medio día es del día pedido, no de un extremo", exception.Message);
    }

    [Theory]
    [InlineData("Vacation")]
    [InlineData("SickLeave")]
    public void Create_HalfDayForAnythingButLeave_Throws(string type)
    {
        var exception = Assert.Throws<DomainException>(() =>
            Create(type: AbsenceType.From(type), start: Monday, end: Monday, halfDay: true));

        Assert.Equal("Sólo un permiso puede pedirse por medio día", exception.Message);
    }

    [Fact]
    public void Create_HalfDayOverSeveralDays_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            Create(type: AbsenceType.Leave, start: Monday, end: Wednesday, halfDay: true));

        Assert.Equal("Un medio día se pide sobre un solo día", exception.Message);
    }

    [Fact]
    public void Create_MultiDayLeaveWithoutHalfDay_IsValid()
    {
        Absence absence = Create(type: AbsenceType.Leave, start: Monday, end: Wednesday);

        Assert.False(absence.StartsHalfDay);
    }

    // ── Aprobar ───────────────────────────────────────────────────────────────

    [Fact]
    public void Approve_FromRequested_Succeeds()
    {
        Absence absence = Create();

        absence.Approve();

        Assert.Equal(AbsenceStatus.Approved, absence.Status);
        Assert.NotNull(absence.UpdatedAtUtc);
    }

    [Fact]
    public void Approve_Twice_Throws()
    {
        Absence absence = Create();
        absence.Approve();

        var exception = Assert.Throws<DomainException>(absence.Approve);

        Assert.Equal("Sólo una ausencia solicitada puede aprobarse", exception.Message);
    }

    [Fact]
    public void Approve_AfterReject_Throws()
    {
        Absence absence = Create();
        absence.Reject("No alcanza la capacidad");

        var exception = Assert.Throws<DomainException>(absence.Approve);

        Assert.Equal("Una ausencia rechazada no cambia de estado", exception.Message);
    }

    // ── Rechazar ──────────────────────────────────────────────────────────────

    [Fact]
    public void Reject_FromRequested_TracesTheReason()
    {
        Absence absence = Create();

        absence.Reject("  Coincide con el cierre del sprint  ");

        Assert.Equal(AbsenceStatus.Rejected, absence.Status);
        Assert.Equal("Coincide con el cierre del sprint", absence.RejectReason);
    }

    [Fact]
    public void Reject_FromApproved_RevertsTheApproval()
    {
        // Es la única forma de deshacer una aprobación equivocada.
        Absence absence = Create();
        absence.Approve();

        absence.Reject("Se aprobó por error");

        Assert.Equal(AbsenceStatus.Rejected, absence.Status);
        Assert.Equal("Se aprobó por error", absence.RejectReason);
    }

    [Fact]
    public void Reject_DoesNotGoBackToRequested()
    {
        // El registro debe decir que hubo una aprobación y que se revirtió.
        Absence absence = Create();
        absence.Approve();
        absence.Reject("Se aprobó por error");

        Assert.NotEqual(AbsenceStatus.Requested, absence.Status);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Reject_WithoutReason_Throws(string reason)
    {
        Absence absence = Create();

        var exception = Assert.Throws<DomainException>(() => absence.Reject(reason));

        Assert.Equal("El motivo del rechazo es obligatorio", exception.Message);
    }

    [Fact]
    public void Reject_WithReasonOver500_Throws()
    {
        Absence absence = Create();

        Assert.Throws<DomainException>(() => absence.Reject(new string('A', 501)));
    }

    [Fact]
    public void Reject_Twice_Throws()
    {
        Absence absence = Create();
        absence.Reject("Primera razón");

        var exception = Assert.Throws<DomainException>(() => absence.Reject("Segunda razón"));

        Assert.Equal("Una ausencia rechazada no cambia de estado", exception.Message);
        Assert.Equal("Primera razón", absence.RejectReason);
    }
}
