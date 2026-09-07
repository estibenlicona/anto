using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// El banco de preguntas con el que se evalúa el dimensionamiento de una
/// iniciativa. Agregado de fila única que se reemplaza en bloque: editar,
/// agregar y quitar preguntas se confirma todo junto.
///
/// Las dimensiones no se guardan como lista aparte — cada pregunta lleva la
/// suya, del catálogo cerrado — para que no haya dos listas que puedan
/// discrepar sobre cuáles son.
/// </summary>
public sealed class QuestionPool : AggregateRoot
{
    private readonly List<PoolQuestion> _questions = [];

    private QuestionPool()
    {
    }

    public QuestionPool(IReadOnlyList<PoolQuestion> questions)
    {
        Set(questions);
    }

    /// <summary>Las preguntas, en el orden en que se guardaron.</summary>
    public IReadOnlyCollection<PoolQuestion> Questions => _questions.AsReadOnly();

    public void Replace(IReadOnlyList<PoolQuestion> questions)
    {
        Set(questions);
        MarkUpdated();
    }

    private void Set(IReadOnlyList<PoolQuestion> questions)
    {
        ArgumentNullException.ThrowIfNull(questions);

        var codes = new HashSet<string>(StringComparer.Ordinal);
        foreach (PoolQuestion question in questions)
        {
            if (!codes.Add(question.Code))
            {
                throw new DomainException($"El id de la pregunta se repite: {question.Code}.");
            }
        }

        _questions.Clear();
        _questions.AddRange(questions.OrderBy(q => q.Position));
    }
}
