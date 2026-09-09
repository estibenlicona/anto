using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una pregunta dentro de una versión del modelo: su código estable, la
/// dimensión a la que pertenece, su tipo, sus opciones de respuesta, el driver
/// que alimenta y cuánto pesa en cada salida.
///
/// <see cref="Code"/> existe aparte del texto porque el texto es justamente lo
/// que se edita: si la pregunta se identificara por él, reformularla sería
/// indistinguible de borrarla y crear otra — y las estimaciones guardadas
/// referencian ese código.
///
/// <see cref="Weights"/> es la fila de la matriz pregunta × salida. Una salida
/// **ausente** del diccionario es "no aporta"; con peso cero es "aporta, y pesa
/// cero". Numéricamente da igual; en la lectura y en el editor no, y por eso se
/// modela como ausencia y no como valor.
/// </summary>
public sealed class ModelQuestion
{
    private readonly List<ModelQuestionOption> _options = [];

    private ModelQuestion()
    {
    }

    public ModelQuestion(
        int position,
        string code,
        string dimensionCode,
        string texto,
        EstimationQuestionType type,
        string? unit,
        string driverCode,
        bool active,
        IReadOnlyList<ModelQuestionOption> options,
        IReadOnlyDictionary<EstimationOutput, decimal> weights)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(weights);

        if (position < 0)
        {
            throw new DomainException("La posición de la pregunta no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código de la pregunta es obligatorio.");
        }

        if (code.Trim().Length > 50)
        {
            throw new DomainException("El código de la pregunta no puede superar 50 caracteres.");
        }

        string id = code.Trim();

        if (string.IsNullOrWhiteSpace(dimensionCode))
        {
            throw new DomainException($"La pregunta {id} tiene que pertenecer a una dimensión.");
        }

        if (string.IsNullOrWhiteSpace(texto))
        {
            throw new DomainException($"El texto de la pregunta {id} es obligatorio.");
        }

        if (texto.Trim().Length > 500)
        {
            throw new DomainException("El texto de la pregunta no puede superar 500 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(driverCode))
        {
            throw new DomainException($"La pregunta {id} tiene que apuntar a un driver.");
        }

        ValidateOptions(id, type, unit, options);

        foreach ((EstimationOutput output, decimal weight) in weights)
        {
            if (weight < 0m)
            {
                throw new DomainException(
                    $"El peso de la pregunta {id} en {output} no puede ser negativo.");
            }
        }

        Position = position;
        Code = id;
        DimensionCode = dimensionCode.Trim();
        Texto = texto.Trim();
        Type = type;
        Unit = string.IsNullOrWhiteSpace(unit) ? null : unit.Trim();
        DriverCode = driverCode.Trim();
        Active = active;
        _options.AddRange(options.OrderBy(o => o.Position));
        Weights = weights.ToDictionary(pair => pair.Key, pair => pair.Value);
    }

    public int Position { get; private set; }

    /// <summary>El <c>id</c> del contrato: estable, independiente del texto.</summary>
    public string Code { get; private set; } = string.Empty;

    public string DimensionCode { get; private set; } = string.Empty;

    public string Texto { get; private set; } = string.Empty;

    public EstimationQuestionType Type { get; private set; }

    /// <summary>La unidad de la magnitud; obligatoria sólo en una cuantitativa.</summary>
    public string? Unit { get; private set; }

    public string DriverCode { get; private set; } = string.Empty;

    /// <summary>Una pregunta inactiva sale del cuestionario sin perder su historia.</summary>
    public bool Active { get; private set; }

    public IReadOnlyList<ModelQuestionOption> Options => _options.AsReadOnly();

    /// <summary>Una salida ausente es "no aporta", que no es un peso de cero.</summary>
    public IReadOnlyDictionary<EstimationOutput, decimal> Weights { get; private set; } =
        new Dictionary<EstimationOutput, decimal>();

    /// <summary>Reemplaza la fila de pesos de la pregunta.</summary>
    public ModelQuestion WithWeights(IReadOnlyDictionary<EstimationOutput, decimal> weights) =>
        new(Position, Code, DimensionCode, Texto, Type, Unit, DriverCode, Active, _options, weights);

    /// <summary>La opción en la que cae una respuesta cruda, o <c>null</c> si no cae en ninguna.</summary>
    public ModelQuestionOption? Resolve(int? optionIndex, decimal? number)
    {
        if (Type is EstimationQuestionType.Cuantitativa)
        {
            if (number is null)
            {
                return null;
            }

            for (int i = 0; i < _options.Count; i++)
            {
                if (_options[i].Contains(number.Value, first: i == 0))
                {
                    return _options[i];
                }
            }

            return null;
        }

        return optionIndex is int index && index >= 0 && index < _options.Count
            ? _options[index]
            : null;
    }

    private static void ValidateOptions(
        string id,
        EstimationQuestionType type,
        string? unit,
        IReadOnlyList<ModelQuestionOption> options)
    {
        if (options.Count < 2)
        {
            throw new DomainException($"La pregunta {id} tiene que ofrecer al menos dos opciones.");
        }

        // Dos opciones que valen lo mismo son indistinguibles para el motor: la
        // que se elija da el mismo resultado, así que una de las dos sobra.
        if (options.Select(o => o.Score).Distinct().Count() != options.Count)
        {
            throw new DomainException(
                $"La pregunta {id} tiene dos opciones con el mismo puntaje normalizado.");
        }

        if (type is EstimationQuestionType.Binaria && options.Count != 2)
        {
            throw new DomainException($"La pregunta binaria {id} tiene que ofrecer exactamente dos opciones.");
        }

        if (type is not EstimationQuestionType.Cuantitativa)
        {
            if (options.Any(o => o.From is not null || o.To is not null))
            {
                throw new DomainException(
                    $"Sólo una pregunta cuantitativa define tramos; la pregunta {id} no lo es.");
            }

            return;
        }

        if (string.IsNullOrWhiteSpace(unit))
        {
            throw new DomainException($"La pregunta cuantitativa {id} tiene que declarar su unidad.");
        }

        List<ModelQuestionOption> ordered = [.. options.OrderBy(o => o.Position)];

        if (ordered[^1].To is not null)
        {
            throw new DomainException(
                $"El último tramo de la pregunta {id} tiene que quedar sin tope para cubrir todo el dominio.");
        }

        // Contiguos: el techo de cada tramo es el piso del siguiente. Con dos
        // números por tramo cualquier otra cosa deja un hueco o un solape, y no
        // hay forma de saber cuál de los dos manda.
        for (int i = 1; i < ordered.Count; i++)
        {
            if (ordered[i - 1].To is null)
            {
                throw new DomainException(
                    $"Un tramo sin tope de la pregunta {id} tiene que ser el último.");
            }

            if (ordered[i].From != ordered[i - 1].To)
            {
                throw new DomainException(
                    $"Los tramos de la pregunta {id} dejan un hueco o se solapan entre " +
                    $"{ordered[i - 1].To} y {ordered[i].From}.");
            }
        }
    }
}
