using Moq;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CreatePersonUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CreatePersonValidator _validator = new();

    private CreatePersonUseCase CreateUseCase() =>
        new(_repository.Object, _unitOfWork.Object, _validator);

    [Fact]
    public async Task ExecuteAsync_CreatesPerson_WhenDocumentIdIsUnique()
    {
        CreatePersonRequest request = TestDataFactory.CreatePersonRequest();

        _repository.Setup(r => r.ExistsByDocumentIdAsync(request.DocumentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository.Setup(r => r.ExistsByUserPrincipalNameAsync(request.UserPrincipalName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository.Setup(r => r.AddAsync(It.IsAny<Person>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        CreatePersonResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.NotEqual(Guid.Empty, response.Person.Id);
        Assert.Equal(request.Name, response.Person.Name);
        Assert.Equal(request.Seniority, response.Person.Seniority);
        _repository.Verify(r => r.AddAsync(It.IsAny<Person>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenDocumentIdAlreadyExists()
    {
        CreatePersonRequest request = TestDataFactory.CreatePersonRequest();
        _repository.Setup(r => r.ExistsByDocumentIdAsync(request.DocumentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => CreateUseCase().ExecuteAsync(request));
        _repository.Verify(r => r.AddAsync(It.IsAny<Person>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsBadRequest_WhenUpnAlreadyExists()
    {
        CreatePersonRequest request = TestDataFactory.CreatePersonRequest();
        _repository.Setup(r => r.ExistsByDocumentIdAsync(request.DocumentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repository.Setup(r => r.ExistsByUserPrincipalNameAsync(request.UserPrincipalName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => CreateUseCase().ExecuteAsync(request));
        _repository.Verify(r => r.AddAsync(It.IsAny<Person>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        CreatePersonRequest request = TestDataFactory.CreatePersonRequest(name: string.Empty);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));
        _repository.Verify(r => r.ExistsByDocumentIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
