using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ModalityTests
{
    [Theory]
    [InlineData("Remote")]
    [InlineData("Hybrid")]
    [InlineData("OnSite")]
    public void From_WithValidValue_Succeeds(string value)
    {
        var modality = Modality.From(value);
        Assert.Equal(value, modality.Value);
    }

    [Fact]
    public void From_IsCaseInsensitive()
    {
        Assert.Equal(Modality.Remote, Modality.From("remote"));
        Assert.Equal(Modality.Hybrid, Modality.From("HYBRID"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("FullRemote")]
    [InlineData("Office")]
    public void From_WithInvalidValue_ThrowsDomainException(string value)
    {
        Assert.Throws<DomainException>(() => Modality.From(value));
    }

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        Assert.Equal(Modality.From("Hybrid"), Modality.From("Hybrid"));
    }

    [Fact]
    public void StaticInstances_HaveCorrectValues()
    {
        Assert.Equal("Remote", Modality.Remote.Value);
        Assert.Equal("Hybrid", Modality.Hybrid.Value);
        Assert.Equal("OnSite", Modality.OnSite.Value);
    }
}
