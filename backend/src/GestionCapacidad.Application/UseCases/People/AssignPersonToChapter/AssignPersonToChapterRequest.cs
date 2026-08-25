namespace GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;

public sealed record AssignPersonToChapterRequest(Guid PersonId, Guid ChapterId);
