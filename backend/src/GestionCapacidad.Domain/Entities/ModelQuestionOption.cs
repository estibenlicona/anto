using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una opción de respuesta con su puntaje normalizado entre 0 y 1.
///
/// El puntaje es normalizado y no un entero de una escala fija para que dos
/// preguntas con distinta cantidad de opciones sean comparables: una de tres
/// niveles y una de cinco aportan lo mismo cuando las dos están al tope, y lo
/// que decide cuánto pesan es la matriz de pesos, no cuántas opciones tienen.
///
/// En una pregunta cuantitativa <see cref="From"/> y <see cref="To"/> delimitan
/// el tramo sobre el número que responde el usuario: <c>From</c> exclusivo
/// salvo en la primera opción, <c>To</c> inclusivo, y <c>To</c> nulo en la
/// última significa "sin tope".
/// </summary>
public sealed class ModelQuestionOption
{
    private ModelQuestionOption()
    {
    }

    public ModelQuestionOption(int position, string label, decimal score, decimal? from, decimal? to)
    {
        if (position < 0)
        {
            throw new DomainException("La posición de la opción no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(label))
        {
            throw new DomainException("La etiqueta de la opción es obligatoria.");
        }

        if (label.Trim().Length > 100)
        {
            throw new DomainException("La etiqueta de la opción no puede superar 100 caracteres.");
        }

        if (score is < 0m or > 1m)
        {
            throw new DomainException(
                $"El puntaje de la opción «{label.Trim()}» debe estar entre 0 y 1. Recibido: {score}.");
        }

        if (from is not null && to is not null && from > to)
        {
            throw new DomainException(
                $"El tramo de la opción «{label.Trim()}» empieza después de donde termina.");
        }

        Position = position;
        Label = label.Trim();
        Score = score;
        From = from;
        To = to;
    }

    public int Position { get; private set; }

    public string Label { get; private set; } = string.Empty;

    /// <summary>Cuánto vale la opción, entre 0 y 1.</summary>
    public decimal Score { get; private set; }

    /// <summary>El piso del tramo, sólo en una cuantitativa.</summary>
    public decimal? From { get; private set; }

    /// <summary>El techo del tramo; nulo en la última opción significa sin tope.</summary>
    public decimal? To { get; private set; }

    /// <summary>Si el número cae en este tramo. <paramref name="first"/> incluye su piso.</summary>
    public bool Contains(decimal value, bool first) =>
        (From is null || (first ? value >= From : value > From))
        && (To is null || value <= To);
}
