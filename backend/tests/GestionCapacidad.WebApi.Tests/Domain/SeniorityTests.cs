using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SeniorityTests
{
    // ── Valid levels ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    public void From_WithValidLevel_Succeeds(int level)
    {
        var seniority = Seniority.From(level);
        Assert.Equal(level, seniority.Value);
    }

    [Fact]
    public void Level1_IsPrincipiante()
    {
        Assert.Equal("Principiante", Seniority.Principiante.Label);
        Assert.Equal(1, Seniority.Principiante.Value);
    }

    [Fact]
    public void Level2_IsCompetente()
    {
        Assert.Equal("Competente", Seniority.Competente.Label);
        Assert.Equal(2, Seniority.Competente.Value);
    }

    [Fact]
    public void Level3_IsAvanzado()
    {
        Assert.Equal("Avanzado", Seniority.Avanzado.Label);
        Assert.Equal(3, Seniority.Avanzado.Value);
    }

    [Fact]
    public void Level4_IsExperto()
    {
        Assert.Equal("Experto", Seniority.Experto.Label);
        Assert.Equal(4, Seniority.Experto.Value);
    }

    // ── Invalid levels ────────────────────────────────────────────────────────

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    [InlineData(-1)]
    public void From_WithOutOfRangeLevel_ThrowsDomainException(int level)
    {
        Assert.Throws<DomainException>(() => Seniority.From(level));
    }

    [Fact]
    public void MaxLevel_IsFour_TuyaScale()
    {
        Assert.Equal(4, Seniority.Max);
    }

    // ── Equality ──────────────────────────────────────────────────────────────

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        Assert.Equal(Seniority.From(3), Seniority.From(3));
    }

    [Fact]
    public void TwoInstances_WithDifferentValues_AreNotEqual()
    {
        Assert.NotEqual(Seniority.Competente, Seniority.Experto);
    }

    // ── ToString ──────────────────────────────────────────────────────────────

    [Fact]
    public void ToString_IncludesValueAndLabel()
    {
        Assert.Equal("3 - Avanzado", Seniority.Avanzado.ToString());
    }
}
