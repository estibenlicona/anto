using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class QuestionDimensionTests
{
    [Fact]
    public void ValidValues_ContainsTheSevenDimensions_InReferenceOrder()
    {
        Assert.Equal(
            [
                "Negocio y cliente",
                "Alcance funcional",
                "Integraciones",
                "Datos, seguridad y cumplimiento",
                "Tecnología y arquitectura",
                "Operación y soporte",
                "Incertidumbre y dependencias",
            ],
            QuestionDimension.ValidValues.Select(d => d.Value));
    }

    [Theory]
    [InlineData("Negocio y cliente")]
    [InlineData("Datos, seguridad y cumplimiento")]
    [InlineData("Incertidumbre y dependencias")]
    public void From_WithValidName_ReturnsDimension(string value)
    {
        Assert.Equal(value, QuestionDimension.From(value).Value);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Negocio")]
    [InlineData("negocio y cliente")]
    [InlineData("Negocio y cliente ")]
    public void From_WithInvalidName_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => QuestionDimension.From(value));

        Assert.Contains("Negocio y cliente", exception.Message);
        Assert.Contains("Incertidumbre y dependencias", exception.Message);
    }

    [Fact]
    public void Dimensions_AreComparedByValue()
    {
        Assert.Equal(QuestionDimension.Integraciones, QuestionDimension.From("Integraciones"));
        Assert.NotEqual(QuestionDimension.Integraciones, QuestionDimension.OperacionYSoporte);
    }
}
