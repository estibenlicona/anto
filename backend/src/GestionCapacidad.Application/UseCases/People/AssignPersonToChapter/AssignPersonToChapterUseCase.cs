using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;

public sealed class AssignPersonToChapterUseCase(
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<AssignPersonToChapterRequest>
{
    public async Task ExecuteAsync(AssignPersonToChapterRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.PersonId}' was not found.");

        person.AssignToChapter(request.ChapterId);

        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
