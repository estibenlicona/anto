namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Las salidas del modelo de estimación. Las tres primeras son resultados que
/// se leen por separado —el peso de una pregunta en riesgo no puede mover el
/// tamaño ni el esfuerzo—; <see cref="Mix"/> no es un resultado sino el eje por
/// el que una respuesta alimenta a los modificadores de composición.
///
/// Es un enum y no un record cerrado como el resto de los value objects del
/// dominio porque es la clave de una matriz: se usa como índice de diccionario
/// en la fila de pesos de cada pregunta, y ahí un enum es lo que se espera.
/// </summary>
public enum EstimationOutput
{
    Size,
    Effort,
    Risk,
    Mix,
}
