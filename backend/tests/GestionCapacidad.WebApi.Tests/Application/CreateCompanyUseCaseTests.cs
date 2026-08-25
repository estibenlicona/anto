using Moq;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CreateCompanyUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_CreatesAValidCompany()
    {
        CreateCompanyRequest request = TestDataFactory.CreateCompanyRequest();
        var companyRepository = new Mock<ICompanyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        companyRepository
            .Setup(repository => repository.ExistsByIdentificationNumberAsync(
                request.IdentificationNumber,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        companyRepository
            .Setup(repository => repository.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var useCase = new CreateCompanyUseCase(
            companyRepository.Object,
            unitOfWork.Object,
            new CreateCompanyValidator());

        CreateCompanyResponse response = await useCase.ExecuteAsync(request);

        Assert.NotEqual(Guid.Empty, response.Id);
        Assert.Equal(request.Name, response.Name);
        Assert.Equal(request.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(request.Email, response.Email);
        Assert.True(response.IsActive);

        companyRepository.Verify(
            repository => repository.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()),
            Times.Once);
        unitOfWork.Verify(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_RejectsDuplicatedIdentificationNumber()
    {
        CreateCompanyRequest request = TestDataFactory.CreateCompanyRequest();
        var companyRepository = new Mock<ICompanyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        companyRepository
            .Setup(repository => repository.ExistsByIdentificationNumberAsync(
                request.IdentificationNumber,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var useCase = new CreateCompanyUseCase(
            companyRepository.Object,
            unitOfWork.Object,
            new CreateCompanyValidator());

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(request));

        companyRepository.Verify(
            repository => repository.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
