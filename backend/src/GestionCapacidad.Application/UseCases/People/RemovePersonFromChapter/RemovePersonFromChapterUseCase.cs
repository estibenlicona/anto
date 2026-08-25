using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;

public sealed class RemovePersonFromChapterUseCase(
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<RemovePersonFromChapterRequest>
{
    public async Task ExecuteAsync(RemovePersonFromChapterRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.PersonId}' was not found.");

        person.RemoveFromChapter();

        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
