using Moq;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class UpdatePersonUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly UpdatePersonValidator _validator = new();

    private UpdatePersonUseCase CreateUseCase() =>
        new(_repository.Object, _unitOfWork.Object, _validator);

    [Fact]
    public async Task ExecuteAsync_UpdatesPerson_WhenExists()
    {
        Person person = TestDataFactory.CreatePerson(seniority: Seniority.Principiante);
        UpdatePersonRequest request = TestDataFactory.UpdatePersonRequest(
            id: person.Id, name: "Updated Name", seniority: 4);

        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        UpdatePersonResponse response = await CreateUseCase().ExecuteAsync(request);

        Assert.Equal("Updated Name", response.Person.Name);
        Assert.Equal(4, response.Person.Seniority);
        Assert.NotNull(response.Person.UpdatedAtUtc);
        _repository.Verify(r => r.Update(It.IsAny<Person>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        UpdatePersonRequest request = TestDataFactory.UpdatePersonRequest();
        _repository.Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateUseCase().ExecuteAsync(request));
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsValidationException_WhenRequestIsInvalid()
    {
        UpdatePersonRequest request = TestDataFactory.UpdatePersonRequest(name: string.Empty);

        await Assert.ThrowsAsync<ValidationException>(() => CreateUseCase().ExecuteAsync(request));
        _repository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
