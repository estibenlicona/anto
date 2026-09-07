using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SeniorityTests
{
    // ── Catálogo cerrado ──────────────────────────────────────────────────────

    [Theory]
    [InlineData("Junior", "Junior")]
    [InlineData("Intermediate", "Intermedio")]
    [InlineData("Senior", "Senior")]
    public void From_WithValidSlug_ReturnsValueWithSpanishLabel(string slug, string label)
    {
        var seniority = Seniority.From(slug);

        Assert.Equal(slug, seniority.Value);
        Assert.Equal(label, seniority.Label);
    }

    [Fact]
    public void ValidValues_ContainsTheThreeSteps_InAscendingOrder()
    {
        Assert.Equal(
            ["Junior", "Intermediate", "Senior"],
            Seniority.ValidValues.Select(s => s.Value));
    }

    // ── Valores inválidos ─────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("junior")] // el slug es exacto: la validación de forma vive en el validador
    [InlineData("MidLevel")]
    [InlineData("Experto")] // un nivel de la escala Tuya no es un seniority
    public void From_WithInvalidValue_Throws(string value)
    {
        var exception = Assert.Throws<DomainException>(() => Seniority.From(value));

        Assert.Contains("Junior, Intermediate, Senior", exception.Message);
    }

    // ── Igualdad de record ────────────────────────────────────────────────────

    [Fact]
    public void From_SameSlug_AreEqual()
    {
        Assert.Equal(Seniority.Senior, Seniority.From("Senior"));
        Assert.NotEqual(Seniority.Junior, Seniority.Intermediate);
    }
}
