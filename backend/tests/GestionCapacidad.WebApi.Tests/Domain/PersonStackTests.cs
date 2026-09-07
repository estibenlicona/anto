using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PersonStackTests
{
    [Fact]
    public void Create_WithValidData_TrimsName()
    {
        var stack = new PersonStack("  .NET  ", Level.Avanzado, isPrimary: true);

        Assert.Equal(".NET", stack.Name);
        Assert.Equal(Level.Avanzado, stack.Level);
        Assert.True(stack.IsPrimary);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() =>
            new PersonStack(name, Level.Avanzado, isPrimary: false));
    }

    [Fact]
    public void Create_WithNameExceedingMaxLength_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new PersonStack(new string('A', 101), Level.Avanzado, isPrimary: false));
    }
}
