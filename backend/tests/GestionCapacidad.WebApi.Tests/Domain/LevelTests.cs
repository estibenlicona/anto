using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class LevelTests
{
    // ── Valid levels ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    public void From_WithValidLevel_Succeeds(int value)
    {
        var level = Level.From(value);
        Assert.Equal(value, level.Value);
    }

    [Fact]
    public void Level1_IsPrincipiante()
    {
        Assert.Equal("Principiante", Level.Principiante.Label);
        Assert.Equal(1, Level.Principiante.Value);
    }

    [Fact]
    public void Level2_IsCompetente()
    {
        Assert.Equal("Competente", Level.Competente.Label);
        Assert.Equal(2, Level.Competente.Value);
    }

    [Fact]
    public void Level3_IsAvanzado()
    {
        Assert.Equal("Avanzado", Level.Avanzado.Label);
        Assert.Equal(3, Level.Avanzado.Value);
    }

    [Fact]
    public void Level4_IsExperto()
    {
        Assert.Equal("Experto", Level.Experto.Label);
        Assert.Equal(4, Level.Experto.Value);
    }

    // ── Invalid levels ────────────────────────────────────────────────────────

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    [InlineData(-1)]
    public void From_WithOutOfRangeLevel_ThrowsDomainException(int level)
    {
        Assert.Throws<DomainException>(() => Level.From(level));
    }

    [Fact]
    public void MaxLevel_IsFour_TuyaScale()
    {
        Assert.Equal(4, Level.Max);
    }

    // ── Equality ──────────────────────────────────────────────────────────────

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        Assert.Equal(Level.From(3), Level.From(3));
    }

    [Fact]
    public void TwoInstances_WithDifferentValues_AreNotEqual()
    {
        Assert.NotEqual(Level.Competente, Level.Experto);
    }

    // ── ToString ──────────────────────────────────────────────────────────────

    [Fact]
    public void ToString_IncludesValueAndLabel()
    {
        Assert.Equal("3 - Avanzado", Level.Avanzado.ToString());
    }
}
