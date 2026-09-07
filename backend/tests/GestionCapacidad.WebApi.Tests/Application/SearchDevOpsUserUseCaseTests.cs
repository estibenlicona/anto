using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Application.UseCases.PersonDetail.SearchDevOpsUser;
using GestionCapacidad.Domain.Exceptions;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SearchDevOpsUserUseCaseTests
{
    private readonly Mock<IAzureDevOpsClient> _client = new();

    private SearchDevOpsUserUseCase NewUseCase() => new(_client.Object);

    [Fact]
    public async Task ExecuteAsync_MissingEmail_Throws400()
    {
        await Assert.ThrowsAsync<BadRequestException>(() => NewUseCase().ExecuteAsync(new SearchDevOpsUserRequest(null)));
    }

    [Fact]
    public async Task ExecuteAsync_NoMatch_Throws404()
    {
        _client.Setup(c => c.SearchUserByEmailAsync("nadie@tuya.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((DevOpsUserSearchResultDto?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => NewUseCase().ExecuteAsync(new SearchDevOpsUserRequest("nadie@tuya.com")));
    }

    [Fact]
    public async Task ExecuteAsync_Match_ReturnsDto()
    {
        _client.Setup(c => c.SearchUserByEmailAsync("maria.gonzalez@tuya.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DevOpsUserSearchResultDto(
                "u1", "María González", "maria.gonzalez@tuya.com", null, ["Ecosistema Digital"], ["Backend"], ["Board 1"]));

        SearchDevOpsUserResponse response = await NewUseCase().ExecuteAsync(
            new SearchDevOpsUserRequest("maria.gonzalez@tuya.com"));

        Assert.Equal("u1", response.User.Id);
        Assert.Equal("María González", response.User.DisplayName);
    }
}
