using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class LineCapacityCalculatorTests
{
    [Fact]
    public void NoPeople_RespondsZeroesWithoutThrowing()
    {
        LineCapacityDto capacity = LineCapacityCalculator.Compute([], new Dictionary<Guid, Allocation>());

        Assert.Equal(0, capacity.PeopleCount);
        Assert.Equal(0, capacity.AvailableFte);
        Assert.Equal(0, capacity.AllocatedFte);
        Assert.Equal(0, capacity.FreeFte);
        Assert.Equal(0, capacity.UnallocatedPercentage);
    }

    [Fact]
    public void PartTimePeopleFullyAllocated_FreeFteIsClampedToZero_NotNegative()
    {
        Person partTime = TestDataFactory.CreatePerson(name: "Part-time");
        partTime.UpdateAvailability(Fte.From(0.5f));
        var allocation = new Allocation(partTime.Id, Guid.NewGuid(), null, Percentage.From(100), Percentage.From(100), Percentage.Zero);

        LineCapacityDto capacity = LineCapacityCalculator.Compute(
            [partTime], new Dictionary<Guid, Allocation> { [partTime.Id] = allocation });

        Assert.Equal(0, capacity.FreeFte);
    }

    [Fact]
    public void PersonWithoutAllocation_ContributesZeroToAllocatedFte()
    {
        Person unassigned = TestDataFactory.CreatePerson(name: "Sin Asignar");

        LineCapacityDto capacity = LineCapacityCalculator.Compute([unassigned], new Dictionary<Guid, Allocation>());

        Assert.Equal(0, capacity.AllocatedFte);
        Assert.Equal(1, capacity.FreeFte);
        Assert.Equal(100, capacity.UnallocatedPercentage);
    }
}
