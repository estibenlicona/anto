using Moq;
using GestionCapacidad.Application.UseCases.People.GetPeople;
using GestionCapacidad.Application.UseCases.People.GetPersonById;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetPeopleUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();

    [Fact]
    public async Task ExecuteAsync_ReturnsPageOfPeople()
    {
        var people = new[] {
            TestDataFactory.CreatePerson(name: "Alice"),
            TestDataFactory.CreatePerson(name: "Bob")
        };
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((people, people.Length));

        GetPeopleResponse response = await new GetPeopleUseCase(_repository.Object)
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        Assert.Equal(2, response.People.Items.Count);
        Assert.Equal(2, response.People.TotalCount);
        Assert.Equal(1, response.People.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsEmpty_WhenNoPeopleExist()
    {
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Array.Empty<Person>(), 0));

        GetPeopleResponse response = await new GetPeopleUseCase(_repository.Object)
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        Assert.Empty(response.People.Items);
        Assert.Equal(0, response.People.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesTotalPages_AcrossMultiplePages()
    {
        var page = new[] { TestDataFactory.CreatePerson(name: "Alice") };
        _repository
            .Setup(r => r.GetPagedAsync(2, 1, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((page, 3));

        GetPeopleResponse response = await new GetPeopleUseCase(_repository.Object)
            .ExecuteAsync(new GetPeopleRequest(2, 1));

        Assert.Single(response.People.Items);
        Assert.Equal(3, response.People.TotalCount);
        Assert.Equal(3, response.People.TotalPages);
        Assert.Equal(2, response.People.Page);
    }

    [Fact]
    public async Task ExecuteAsync_PassesSearchAndFilters_ToTheRepository()
    {
        var people = new[] { TestDataFactory.CreatePerson(name: "María González") };
        _repository
            .Setup(r => r.GetPagedAsync(
                1,
                10,
                "maría",
                It.Is<IReadOnlyCollection<int>>(s => s.SequenceEqual(new[] { 3 })),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((people, people.Length));

        GetPeopleResponse response = await new GetPeopleUseCase(_repository.Object)
            .ExecuteAsync(new GetPeopleRequest(1, 10, "maría", new[] { 3 }));

        Assert.Single(response.People.Items);
        _repository.VerifyAll();
    }
}

public sealed class GetPersonByIdUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();

    [Fact]
    public async Task ExecuteAsync_ReturnsPerson_WhenExists()
    {
        Person person = TestDataFactory.CreatePerson(name: "Carlos");
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);

        GetPersonByIdResponse response = await new GetPersonByIdUseCase(_repository.Object)
            .ExecuteAsync(new GetPersonByIdRequest(person.Id));

        Assert.Equal(person.Id, response.Person.Id);
        Assert.Equal("Carlos", response.Person.Name);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new GetPersonByIdUseCase(_repository.Object)
                .ExecuteAsync(new GetPersonByIdRequest(Guid.NewGuid())));
    }
}
