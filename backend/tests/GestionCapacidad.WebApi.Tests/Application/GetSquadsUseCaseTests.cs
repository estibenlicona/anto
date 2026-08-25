using Moq;
using GestionCapacidad.Application.UseCases.Squads.GetSquads;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetSquadsUseCaseTests
{
    private readonly Mock<ISquadRepository> _repository = new();

    private GetSquadsUseCase CreateUseCase() => new(_repository.Object);

    [Fact]
    public async Task ExecuteAsync_ReturnsPageOfSquads()
    {
        var squads = new[]
        {
            TestDataFactory.CreateSquad(name: "Alpha"),
            TestDataFactory.CreateSquad(name: "Beta"),
            TestDataFactory.CreateSquad(name: "Gamma"),
        };

        _repository
            .Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync((squads, squads.Length));

        GetSquadsResponse response = await CreateUseCase().ExecuteAsync(new GetSquadsRequest(1, 10));

        Assert.Equal(3, response.Squads.Items.Count);
        Assert.Equal(3, response.Squads.TotalCount);
        Assert.Contains(response.Squads.Items, s => s.Name == "Alpha");
        Assert.Contains(response.Squads.Items, s => s.Name == "Beta");
        Assert.Contains(response.Squads.Items, s => s.Name == "Gamma");
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsEmpty_WhenNoSquadsExist()
    {
        _repository
            .Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Array.Empty<Squad>(), 0));

        GetSquadsResponse response = await CreateUseCase().ExecuteAsync(new GetSquadsRequest(1, 10));

        Assert.Empty(response.Squads.Items);
        Assert.Equal(0, response.Squads.TotalPages);
    }

    [Fact]
    public async Task ExecuteAsync_ComputesTotalPages_AcrossMultiplePages()
    {
        var page = new[] { TestDataFactory.CreateSquad(name: "Alpha") };

        _repository
            .Setup(r => r.GetPagedAsync(2, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync((page, 3));

        GetSquadsResponse response = await CreateUseCase().ExecuteAsync(new GetSquadsRequest(2, 2));

        Assert.Single(response.Squads.Items);
        Assert.Equal(3, response.Squads.TotalCount);
        Assert.Equal(2, response.Squads.TotalPages);
        Assert.Equal(2, response.Squads.Page);
    }
}
