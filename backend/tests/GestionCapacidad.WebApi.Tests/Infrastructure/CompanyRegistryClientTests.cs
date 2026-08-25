using System.Net;
using System.Reflection;
using Moq;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Infrastructure.ExternalServices.CompanyRegistry;
using GestionCapacidad.RestClient.Exceptions;
using GestionCapacidad.RestClient.Interfaces;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class CompanyRegistryClientTests
{
    [Fact]
    public async Task GetCompanyAsync_CallsRestClientWithExpectedPathAndCancellationToken()
    {
        var restClient = new Mock<IRestClient>();
        using var cancellationTokenSource = new CancellationTokenSource();
        var expectedCompany = new ExternalCompanyDto("900123456", "External Company", "Active");

        restClient
            .Setup(client => client.GetAsync<ExternalCompanyDto>(
                "/companies/900123456",
                cancellationTokenSource.Token))
            .ReturnsAsync(expectedCompany);

        var client = new CompanyRegistryClient(restClient.Object);

        ExternalCompanyDto? company = await client.GetCompanyAsync(
            "900123456",
            cancellationTokenSource.Token);

        Assert.Same(expectedCompany, company);
        restClient.Verify(restClient => restClient.GetAsync<ExternalCompanyDto>(
            "/companies/900123456",
            cancellationTokenSource.Token), Times.Once);
    }

    [Fact]
    public async Task GetCompanyAsync_EncodesIdentificationNumberInPath()
    {
        var restClient = new Mock<IRestClient>();
        var expectedCompany = new ExternalCompanyDto("ABC 123/45", "External Company", "Active");

        restClient
            .Setup(client => client.GetAsync<ExternalCompanyDto>(
                "/companies/ABC%20123%2F45",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCompany);

        var client = new CompanyRegistryClient(restClient.Object);

        ExternalCompanyDto? company = await client.GetCompanyAsync("ABC 123/45");

        Assert.Same(expectedCompany, company);
        restClient.Verify(restClient => restClient.GetAsync<ExternalCompanyDto>(
            "/companies/ABC%20123%2F45",
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCompanyAsync_ReturnsNullWhenDownstreamReturnsNotFound()
    {
        var restClient = new Mock<IRestClient>();
        var exception = new ExternalApiException(
            HttpStatusCode.NotFound,
            "Not Found",
            new Uri("https://example.com/company-registry/companies/900123456"),
            HttpMethod.Get,
            string.Empty,
            "External API request failed with status code 404.");

        restClient
            .Setup(client => client.GetAsync<ExternalCompanyDto>(
                "/companies/900123456",
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        var client = new CompanyRegistryClient(restClient.Object);

        ExternalCompanyDto? company = await client.GetCompanyAsync("900123456");

        Assert.Null(company);
    }

    [Fact]
    public async Task GetCompanyAsync_DoesNotSwallowUnexpectedDownstreamFailures()
    {
        var restClient = new Mock<IRestClient>();
        var exception = new ExternalApiException(
            HttpStatusCode.InternalServerError,
            "Internal Server Error",
            new Uri("https://example.com/company-registry/companies/900123456"),
            HttpMethod.Get,
            string.Empty,
            "External API request failed with status code 500.");

        restClient
            .Setup(client => client.GetAsync<ExternalCompanyDto>(
                "/companies/900123456",
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        var client = new CompanyRegistryClient(restClient.Object);

        await Assert.ThrowsAsync<ExternalApiException>(() => client.GetCompanyAsync("900123456"));
    }

    [Fact]
    public void Constructor_DoesNotInjectHttpClientDirectly()
    {
        ConstructorInfo constructor = Assert.Single(typeof(CompanyRegistryClient).GetConstructors());
        ParameterInfo parameter = Assert.Single(constructor.GetParameters());

        Assert.Equal(typeof(IRestClient), parameter.ParameterType);
    }
}
