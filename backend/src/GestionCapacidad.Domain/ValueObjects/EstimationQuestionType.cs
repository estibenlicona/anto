namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Qué le pide una pregunta a quien responde: una magnitud con su unidad, un
/// nivel dentro de una escala, o una condición de sí o no. El tipo decide qué
/// control se muestra y cómo se interpreta la respuesta cruda contra las
/// opciones de la pregunta.
/// </summary>
public enum EstimationQuestionType
{
    /// <summary>Pide un número; las opciones son tramos sobre ese número.</summary>
    Cuantitativa,

    /// <summary>Pide un nivel; las opciones son la escala.</summary>
    Evaluativa,

    /// <summary>Detecta una condición; las opciones son no y sí.</summary>
    Binaria,
}
