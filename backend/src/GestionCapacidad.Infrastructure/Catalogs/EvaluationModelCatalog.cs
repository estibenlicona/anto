using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Infrastructure.Catalogs;

/// <summary>
/// Las piezas del modelo de evaluación que Admin **no** administra, porque no
/// son parámetros del dimensionamiento sino del formulario y del motor: con
/// qué escala se responde cada pregunta, el tamizaje, y qué hacer con cada
/// talla. Viven acá como catálogo fijo, junto al proveedor que las une con los
/// parámetros editables.
///
/// Si algún día el tamizaje o las escalas se vuelven configurables, este
/// catálogo se reemplaza por sus agregados sin tocar el motor.
/// </summary>
internal static class EvaluationModelCatalog
{
    /// <summary>La escala por defecto: la que usa toda pregunta evaluativa.</summary>
    private static readonly string[] QualitativeScale =
        ["Sin impacto", "Bajo", "Medio", "Alto", "Crítico"];

    /// <summary>
    /// Las preguntas que se responden contando cosas —áreas, canales,
    /// sistemas, equipos— y no valorando impacto. Cualquier pregunta que no
    /// esté acá se lee como evaluativa con la escala cualitativa.
    /// </summary>
    private static readonly IReadOnlyDictionary<string, string[]> ObjectiveScales =
        new Dictionary<string, string[]>(StringComparer.Ordinal)
        {
            ["N4"] = ["Sólo la célula", "1 área", "2 áreas", "3–4 áreas", "5 o más"],
            ["F2"] = ["Ninguno", "1 canal", "2 canales", "3 canales", "4 o más"],
            ["I1"] = ["Ninguno", "1–2", "3–5", "6–10", "Más de 10"],
            ["I2"] = ["Ninguno", "1", "2", "3–4", "5 o más"],
            ["I3"] = ["Ninguna", "1–2", "3–5", "6–10", "Más de 10"],
            ["I4"] = ["Ninguno", "1 equipo", "2 equipos", "3 equipos", "4 o más"],
        };

    /// <summary>
    /// El tamizaje: seis preguntas de sí o no que deciden si la iniciativa
    /// necesita acompañamiento. Marcar una crítica basta para exigirlo.
    /// </summary>
    internal static readonly IReadOnlyList<TriageQuestionDto> Triage =
    [
        new("T1", "¿Integra o modifica sistemas internos o terceros externos?", false),
        new("T2", "¿Procesa datos personales, financieros o sensibles, o está expuesta a internet?", true),
        new("T3", "¿Puede generar fraude, pérdida económica, impacto reputacional o sanción?", true),
        new("T4", "¿Introduce tecnología nueva o cambia arquitectura transversal o compartida?", false),
        new("T5", "¿Impacta una capacidad crítica (pagos, crédito, cartera, recaudo, originación)?", false),
        new("T6", "¿El requerimiento aún es ambiguo o requiere discovery funcional o técnico?", false),
    ];

    /// <summary>Qué hacer con una iniciativa de cada talla.</summary>
    private static readonly IReadOnlyDictionary<string, string> Actions =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["XS"] = "Resolver con capacidad existente o célula ligera.",
            ["S"] = "Célula reducida y apoyo puntual de arquitectura y seguridad.",
            ["M"] = "Célula base y discovery corto para validar supuestos.",
            ["L"] = "Célula completa, arquitectura temprana y validación AppSec.",
            ["XL"] = "Evaluar dividir en frentes o células y hacer discovery formal.",
        };

    internal static (string Kind, IReadOnlyList<string> Scale) KindOf(string questionCode) =>
        ObjectiveScales.TryGetValue(questionCode, out string[]? scale)
            ? ("Objective", scale)
            : ("Evaluative", QualitativeScale);

    /// <summary>
    /// Una talla que Admin renombró no tiene acción declarada: se responde
    /// vacía en vez de inventar una.
    /// </summary>
    internal static string ActionFor(string talla) => Actions.GetValueOrDefault(talla, string.Empty);
}
