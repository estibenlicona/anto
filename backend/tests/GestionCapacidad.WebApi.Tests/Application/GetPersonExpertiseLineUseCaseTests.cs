using GestionCapacidad.Application.UseCases.People.GetPersonExpertiseLine;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetPersonExpertiseLineUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IExpertiseLineRepository> _expertiseLines = new();

    private GetPersonExpertiseLineUseCase NewUseCase() => new(_people.Object, _expertiseLines.Object);

    [Fact]
    public async Task ExecuteAsync_UnknownPerson_Throws404()
    {
        _people.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => NewUseCase().ExecuteAsync(new GetPersonExpertiseLineRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithoutLine_ReturnsNulls()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);

        GetPersonExpertiseLineResponse response = await NewUseCase().ExecuteAsync(
            new GetPersonExpertiseLineRequest(person.Id));

        Assert.Null(response.ExpertiseLine.Id);
        Assert.Null(response.ExpertiseLine.Name);
        _expertiseLines.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_PersonWithLine_ReturnsItsIdAndName()
    {
        Person person = TestDataFactory.CreatePerson(name: "María González");
        var line = new ExpertiseLine("Backend", "BE", "Descripción de la línea");
        person.AssignToExpertiseLine(line.Id);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _expertiseLines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);

        GetPersonExpertiseLineResponse response = await NewUseCase().ExecuteAsync(
            new GetPersonExpertiseLineRequest(person.Id));

        Assert.Equal(line.Id, response.ExpertiseLine.Id);
        Assert.Equal("Backend", response.ExpertiseLine.Name);
    }
}
