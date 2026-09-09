using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una pregunta del tamizaje: el filtro de sí o no que decide si la iniciativa
/// necesita la evaluación completa antes de entrar al cuestionario.
///
/// No aporta puntaje. <see cref="Critical"/> marca las que por sí solas obligan
/// el acompañamiento: una crítica en sí pesa lo mismo que tres no críticas.
/// </summary>
public sealed class ModelTriageQuestion
{
    private ModelTriageQuestion()
    {
    }

    public ModelTriageQuestion(int position, string code, string texto, bool critical)
    {
        if (position < 0)
        {
            throw new DomainException("La posición de la pregunta de tamizaje no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código de la pregunta de tamizaje es obligatorio.");
        }

        if (code.Trim().Length > 50)
        {
            throw new DomainException("El código de la pregunta de tamizaje no puede superar 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(texto))
        {
            throw new DomainException($"El texto de la pregunta de tamizaje {code.Trim()} es obligatorio.");
        }

        if (texto.Trim().Length > 500)
        {
            throw new DomainException("El texto de la pregunta de tamizaje no puede superar 500 caracteres.");
        }

        Position = position;
        Code = code.Trim();
        Texto = texto.Trim();
        Critical = critical;
    }

    public int Position { get; private set; }

    public string Code { get; private set; } = string.Empty;

    public string Texto { get; private set; } = string.Empty;

    /// <summary>Una crítica en sí obliga la evaluación completa por sí sola.</summary>
    public bool Critical { get; private set; }
}
