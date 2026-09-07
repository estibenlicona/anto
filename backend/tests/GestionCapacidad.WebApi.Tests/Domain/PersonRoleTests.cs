using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PersonRoleTests
{
    [Theory]
    [InlineData("Administrator", "Administrador")]
    [InlineData("TechnicalLead", "Líder Técnico")]
    [InlineData("ExpertiseLead", "Líder de Expertise")]
    [InlineData("ProductOwner", "Product Owner")]
    [InlineData("Contributor", "Colaborador")]
    public void From_WithValidSlug_ReturnsRoleWithSpanishLabel(string value, string label)
    {
        PersonRole role = PersonRole.From(value);

        Assert.Equal(value, role.Value);
        Assert.Equal(label, role.Label);
    }

    [Fact]
    public void ValidValues_ContainsTheFiveRoles_InContractOrder()
    {
        Assert.Equal(
            ["Administrator", "TechnicalLead", "ExpertiseLead", "ProductOwner", "Contributor"],
            PersonRole.ValidValues.Select(r => r.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("Developer")]
    [InlineData("technicallead")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => PersonRole.From(value));

        Assert.Contains("Administrator", exception.Message);
        Assert.Contains("Contributor", exception.Message);
    }

    [Fact]
    public void Roles_AreComparedByValue()
    {
        Assert.Equal(PersonRole.TechnicalLead, PersonRole.From("TechnicalLead"));
        Assert.NotEqual(PersonRole.TechnicalLead, PersonRole.Contributor);
    }
}
