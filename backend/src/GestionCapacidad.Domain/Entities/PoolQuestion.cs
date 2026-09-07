using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una pregunta del pool de scoring: su código estable, la dimensión a la que
/// pertenece, su texto y su peso.
///
/// <see cref="Code"/> existe aparte del texto porque el texto es justamente
/// lo que se edita: si la pregunta se identificara por él, reformularla sería
/// indistinguible de borrarla y crear otra — y las evaluaciones guardadas
/// referencian ese código.
/// </summary>
public sealed class PoolQuestion
{
    private PoolQuestion()
    {
    }

    public PoolQuestion(int position, string code, QuestionDimension dimension, string texto, int peso)
    {
        ArgumentNullException.ThrowIfNull(dimension);

        if (position < 0)
        {
            throw new DomainException("La posición de la pregunta no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El id de la pregunta es obligatorio.");
        }

        if (code.Trim().Length > 50)
        {
            throw new DomainException("El id de la pregunta no puede superar 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(texto))
        {
            throw new DomainException($"El texto de la pregunta {code.Trim()} es obligatorio.");
        }

        if (texto.Trim().Length > 500)
        {
            throw new DomainException("El texto de la pregunta no puede superar 500 caracteres.");
        }

        if (peso < 1)
        {
            throw new DomainException(
                $"El peso de la pregunta {code.Trim()} debe ser un entero mayor o igual a 1.");
        }

        Position = position;
        Code = code.Trim();
        Dimension = dimension;
        Texto = texto.Trim();
        Peso = peso;
    }

    public int Position { get; private set; }

    /// <summary>El <c>id</c> del contrato: estable, independiente del texto.</summary>
    public string Code { get; private set; } = string.Empty;

    public QuestionDimension Dimension { get; private set; } = QuestionDimension.NegocioYCliente;

    public string Texto { get; private set; } = string.Empty;

    public int Peso { get; private set; }
}
