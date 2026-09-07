using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SkillCatalogPositionsTests
{
    [Fact]
    public async Task GetCurrentAsync_DedupesAndSortsAlphabetically()
    {
        var people = new Mock<IPersonRepository>();
        Person a = TestDataFactory.CreatePerson(position: "Backend Dev");
        Person b = TestDataFactory.CreatePerson(position: "QA Engineer");
        Person c = TestDataFactory.CreatePerson(position: "Backend Dev");
        people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([a, b, c]);

        IReadOnlyList<string> positions = await SkillCatalogPositions.GetCurrentAsync(people.Object);

        Assert.Equal(["Backend Dev", "QA Engineer"], positions);
    }
}
