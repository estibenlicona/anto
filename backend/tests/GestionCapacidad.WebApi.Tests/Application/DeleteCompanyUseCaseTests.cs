using Moq;
using GestionCapacidad.Application.UseCases.Companies.DeleteCompany;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DeleteCompanyUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_DeactivatesTheCompany()
    {
        Company company = TestDataFactory.CreateCompany();
        var request = new DeleteCompanyRequest(company.Id);
        var companyRepository = new Mock<ICompanyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        companyRepository
            .Setup(repository => repository.GetByIdAsync(company.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(company);

        unitOfWork
            .Setup(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var useCase = new DeleteCompanyUseCase(companyRepository.Object, unitOfWork.Object);

        await useCase.ExecuteAsync(request);

        Assert.False(company.IsActive);
        Assert.NotNull(company.UpdatedAtUtc);
        companyRepository.Verify(repository => repository.Update(company), Times.Once);
        unitOfWork.Verify(unit => unit.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
