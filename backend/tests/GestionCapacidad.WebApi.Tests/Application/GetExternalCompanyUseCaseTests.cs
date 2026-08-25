using Moq;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class GetExternalCompanyUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_ReturnsExternalCompanyWhenFound()
    {
        var client = new Mock<ICompanyRegistryClient>();
        var request = new GetExternalCompanyRequest("900123456");
        var externalCompany = new ExternalCompanyDto(
            request.IdentificationNumber,
            "External Company",
            "Active");

        client
            .Setup(companyRegistryClient => companyRegistryClient.GetCompanyAsync(
                request.IdentificationNumber,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(externalCompany);

        var useCase = new GetExternalCompanyUseCase(client.Object);

        GetExternalCompanyResponse response = await useCase.ExecuteAsync(request);

        Assert.Equal(externalCompany.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(externalCompany.Name, response.Name);
        Assert.Equal(externalCompany.Status, response.Status);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFoundExceptionWhenExternalCompanyDoesNotExist()
    {
        var client = new Mock<ICompanyRegistryClient>();
        var request = new GetExternalCompanyRequest("900123456");

        client
            .Setup(companyRegistryClient => companyRegistryClient.GetCompanyAsync(
                request.IdentificationNumber,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((ExternalCompanyDto?)null);

        var useCase = new GetExternalCompanyUseCase(client.Object);

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.ExecuteAsync(request));
    }

    [Fact]
    public async Task ExecuteAsync_PropagatesCancellationToken()
    {
        var client = new Mock<ICompanyRegistryClient>();
        var request = new GetExternalCompanyRequest("900123456");
        using var cancellationTokenSource = new CancellationTokenSource();

        client
            .Setup(companyRegistryClient => companyRegistryClient.GetCompanyAsync(
                request.IdentificationNumber,
                cancellationTokenSource.Token))
            .ReturnsAsync(new ExternalCompanyDto(request.IdentificationNumber, "External Company", null));

        var useCase = new GetExternalCompanyUseCase(client.Object);

        await useCase.ExecuteAsync(request, cancellationTokenSource.Token);

        client.Verify(companyRegistryClient => companyRegistryClient.GetCompanyAsync(
            request.IdentificationNumber,
            cancellationTokenSource.Token), Times.Once);
    }
}
