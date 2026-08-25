using Moq;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class UpdateCompanyUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_UpdatesAnExistingCompany()
    {
        Company company = TestDataFactory.CreateCompany();
        UpdateCompanyRequest request = TestDataFactory.UpdateCompanyRequest(id: company.Id);
        var companyRepository = new Mock<ICompanyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        companyRepository
            .Setup(repository => repository.GetByIdAsync(company.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(company);

        companyRepository
            .Setup(repository => repository.GetByIdentificationNumberAsync(
                request.IdentificationNumber,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Company?)null);

        unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var useCase = new UpdateCompanyUseCase(
            companyRepository.Object,
            unitOfWork.Object,
            new UpdateCompanyValidator());

        UpdateCompanyResponse response = await useCase.ExecuteAsync(request);

        Assert.Equal(company.Id, response.Id);
        Assert.Equal(request.Name, response.Name);
        Assert.Equal(request.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(request.Email, response.Email);
        Assert.True(response.IsActive);
        Assert.NotNull(company.UpdatedAtUtc);

        companyRepository.Verify(repository => repository.Update(company), Times.Once);
        unitOfWork.Verify(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFoundException_WhenCompanyDoesNotExist()
    {
        UpdateCompanyRequest request = TestDataFactory.UpdateCompanyRequest();
        var companyRepository = new Mock<ICompanyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        companyRepository
            .Setup(repository => repository.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Company?)null);

        var useCase = new UpdateCompanyUseCase(
            companyRepository.Object,
            unitOfWork.Object,
            new UpdateCompanyValidator());

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.ExecuteAsync(request));

        companyRepository.Verify(repository => repository.Update(It.IsAny<Company>()), Times.Never);
    }
}
