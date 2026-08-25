using Moq;
using GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;
using GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;
using GestionCapacidad.Application.UseCases.People.DeletePerson;
using GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class DeletePersonUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    [Fact]
    public async Task ExecuteAsync_DeletesPerson_WhenExists()
    {
        Person person = TestDataFactory.CreatePerson();
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await new DeletePersonUseCase(_repository.Object, _unitOfWork.Object)
            .ExecuteAsync(new DeletePersonRequest(person.Id));

        _repository.Verify(r => r.Delete(It.IsAny<Person>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeletePersonUseCase(_repository.Object, _unitOfWork.Object)
                .ExecuteAsync(new DeletePersonRequest(Guid.NewGuid())));

        _repository.Verify(r => r.Delete(It.IsAny<Person>()), Times.Never);
    }
}

public sealed class AssignPersonToChapterUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    [Fact]
    public async Task ExecuteAsync_AssignsPerson_WhenPersonExists()
    {
        Person person = TestDataFactory.CreatePerson();
        var chapterId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await new AssignPersonToChapterUseCase(_repository.Object, _unitOfWork.Object)
            .ExecuteAsync(new AssignPersonToChapterRequest(person.Id, chapterId));

        Assert.Equal(chapterId, person.ChapterId);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new AssignPersonToChapterUseCase(_repository.Object, _unitOfWork.Object)
                .ExecuteAsync(new AssignPersonToChapterRequest(Guid.NewGuid(), Guid.NewGuid())));
    }
}

public sealed class RemovePersonFromChapterUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    [Fact]
    public async Task ExecuteAsync_RemovesPerson_FromChapter()
    {
        Person person = TestDataFactory.CreatePerson();
        person.AssignToChapter(Guid.NewGuid());
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await new RemovePersonFromChapterUseCase(_repository.Object, _unitOfWork.Object)
            .ExecuteAsync(new RemovePersonFromChapterRequest(person.Id));

        Assert.Null(person.ChapterId);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new RemovePersonFromChapterUseCase(_repository.Object, _unitOfWork.Object)
                .ExecuteAsync(new RemovePersonFromChapterRequest(Guid.NewGuid())));
    }
}

public sealed class AssignPersonToProviderUseCaseTests
{
    private readonly Mock<IPersonRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    [Fact]
    public async Task ExecuteAsync_AssignsProvider_WhenPersonExists()
    {
        Person person = TestDataFactory.CreatePerson();
        var providerId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await new AssignPersonToProviderUseCase(_repository.Object, _unitOfWork.Object)
            .ExecuteAsync(new AssignPersonToProviderRequest(person.Id, providerId));

        Assert.Equal(providerId, person.ProviderId);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_ThrowsNotFound_WhenPersonDoesNotExist()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new AssignPersonToProviderUseCase(_repository.Object, _unitOfWork.Object)
                .ExecuteAsync(new AssignPersonToProviderRequest(Guid.NewGuid(), Guid.NewGuid())));
    }
}
