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
    private readonly Mock<IAllocationRepository> _allocations = new();

    private GetPeopleUseCase BuildUseCase(IReadOnlyList<Person> allPeople)
    {
        _repository
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(allPeople);
        _allocations
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Allocation>());
        return new GetPeopleUseCase(_repository.Object, _allocations.Object);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsPageOfPeople()
    {
        var people = new[] {
            TestDataFactory.CreatePerson(name: "Alice"),
            TestDataFactory.CreatePerson(name: "Bob")
        };
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((people, people.Length));

        GetPeopleResponse response = await BuildUseCase(people)
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        Assert.Equal(2, response.People.Items.Count);
        Assert.Equal(2, response.People.TotalCount);
        Assert.Equal(1, response.People.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsEmpty_WhenNoPeopleExist()
    {
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Array.Empty<Person>(), 0));

        GetPeopleResponse response = await BuildUseCase(Array.Empty<Person>())
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        Assert.Empty(response.People.Items);
        Assert.Equal(0, response.People.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesTotalPages_AcrossMultiplePages()
    {
        var page = new[] { TestDataFactory.CreatePerson(name: "Alice") };
        _repository
            .Setup(r => r.GetPagedAsync(2, 1, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((page, 3));

        GetPeopleResponse response = await BuildUseCase(page)
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
                null,
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((people, people.Length));

        GetPeopleResponse response = await BuildUseCase(people)
            .ExecuteAsync(new GetPeopleRequest(1, 10, "maría", new[] { 3 }));

        Assert.Single(response.People.Items);
        _repository.Verify(r => r.GetPagedAsync(
            1, 10, "maría",
            It.Is<IReadOnlyCollection<int>>(s => s.SequenceEqual(new[] { 3 })),
            null, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_PassesStackFilter_ToTheRepository()
    {
        var people = new[] { TestDataFactory.CreatePerson(name: "María González") };
        _repository
            .Setup(r => r.GetPagedAsync(
                1,
                10,
                null,
                null,
                null,
                It.Is<IReadOnlyCollection<string>>(s => s.SequenceEqual(new[] { ".NET", "Azure" })),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((people, people.Length));

        GetPeopleResponse response = await BuildUseCase(people)
            .ExecuteAsync(new GetPeopleRequest(1, 10, Stacks: new[] { ".NET", "Azure" }));

        Assert.Single(response.People.Items);
    }

    [Fact]
    public async Task ExecuteAsync_ResolvesTechnicalLeadNameAndCount_FromTheWholeSet()
    {
        // El líder no está en la página pero sí en el total: el nombre y el
        // conteo salen del conjunto completo, no de la página.
        Person lead = TestDataFactory.CreatePerson(name: "Carlos López");
        Person follower = TestDataFactory.CreatePerson(name: "Diego Salazar");
        follower.AssignTechnicalLead(lead.Id);

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new[] { follower }, 2));

        GetPeopleResponse response = await BuildUseCase(new[] { lead, follower })
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        var dto = Assert.Single(response.People.Items);
        Assert.Equal(lead.Id, dto.TechnicalLeadId);
        Assert.Equal("Carlos López", dto.TechnicalLeadName);
        Assert.Equal(0, dto.TechnicalLeadOfCount);
    }

    [Fact]
    public async Task ExecuteAsync_SumsUtilization_FromAllocations()
    {
        Person person = TestDataFactory.CreatePerson(name: "Alice");
        var allocations = new[]
        {
            TestDataFactory.CreateAllocation(person.Id, dedication: 40),
            TestDataFactory.CreateAllocation(person.Id, dedication: 30),
        };
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new[] { person }, 1));
        _repository
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { person });
        _allocations
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(allocations);

        GetPeopleResponse response = await new GetPeopleUseCase(_repository.Object, _allocations.Object)
            .ExecuteAsync(new GetPeopleRequest(1, 10));

        Assert.Equal(70, Assert.Single(response.People.Items).Utilization);
    }
}

public sealed class GetPersonByIdUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IAllocationRepository> _allocations = new();

    [Fact]
    public async Task ExecuteAsync_ReturnsPerson_WhenExists()
    {
        Person person = TestDataFactory.CreatePerson(name: "Carlos");
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _repository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new[] { person });
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());

        GetPersonByIdResponse response = await new GetPersonByIdUseCase(_repository.Object, _allocations.Object)
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
            new GetPersonByIdUseCase(_repository.Object, _allocations.Object)
                .ExecuteAsync(new GetPersonByIdRequest(Guid.NewGuid())));
    }
}
