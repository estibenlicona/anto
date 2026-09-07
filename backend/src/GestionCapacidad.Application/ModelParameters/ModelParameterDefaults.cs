using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.ModelParameters;

/// <summary>
/// Los parámetros del modelo de referencia, con los que la plataforma
/// responde mientras nadie los ha guardado todavía.
///
/// Viven acá y no en el seeder porque el seeder sólo corre con el provider
/// InMemory: contra SQL Server o Mongo recién creados los <c>GET</c> de Admin
/// quedarían sin qué responder y el módulo de Iniciativas sin modelo con el
/// que evaluar. Un <c>GET</c> devuelve estos valores sin persistirlos; el
/// primer <c>PUT</c> crea la fila.
///
/// Son el espejo de los valores por defecto de los mocks del frontend
/// (<c>sprint-config</c>, <c>talla-bands</c>, <c>capability-mix</c> y
/// <c>question-pool</c> handlers), que a su vez salen del modelo de
/// referencia v7.
/// </summary>
public static class ModelParameterDefaults
{
    public static SprintConfiguration SprintConfiguration() => new(
        weeks: 2,
        sprintsPerQuarter: 6,
        hoursPerSprint: 80m,
        sprintCloseTime: "23:00",
        historyWindowSprints: 6,
        minHistorySprints: 3);

    public static TallaBandSet TallaBands() => new(
        [20m, 40m, 60m, 80m],
        [
            new TallaBand(0, "XS", 0.5m, 1m, "Cambio menor"),
            new TallaBand(1, "S", 1m, 3m, "Ajuste puntual"),
            new TallaBand(2, "M", 3m, 6m, "Iniciativa media"),
            new TallaBand(3, "L", 6m, 10m, "Iniciativa grande"),
            new TallaBand(4, "XL", 10m, 18m, "Transformación mayor"),
        ]);

    public static CapabilityMix CapabilityMix() => new(
    [
        MixRow(0, "backend-dev", "Backend Dev", xs: 1, s: 2, m: 3, l: 5, xl: 8),
        MixRow(1, "qa-engineer", "QA Engineer", xs: 0, s: 1, m: 1, l: 2, xl: 3),
        MixRow(2, "arquitecto", "Arquitecto", xs: 0, s: 0, m: 1, l: 1, xl: 2),
    ]);

    public static QuestionPool QuestionPool()
    {
        var questions = new List<PoolQuestion>(QuestionSeeds.Length);
        for (int i = 0; i < QuestionSeeds.Length; i++)
        {
            (string code, string dimension, string texto, int peso) = QuestionSeeds[i];
            questions.Add(new PoolQuestion(i, code, QuestionDimension.From(dimension), texto, peso));
        }

        return new QuestionPool(questions);
    }

    private static CapabilityMixRow MixRow(
        int position, string key, string capacidad, int xs, int s, int m, int l, int xl) =>
        new(position, key, capacidad, new Dictionary<string, int>
        {
            ["XS"] = xs,
            ["S"] = s,
            ["M"] = m,
            ["L"] = l,
            ["XL"] = xl,
        });

    /// <summary>
    /// Las 30 preguntas del modelo de referencia, con su dimensión y su peso.
    /// El orden es el de referencia y define el orden de las dimensiones que
    /// el modelo de evaluación expone.
    /// </summary>
    private static readonly (string Code, string Dimension, string Texto, int Peso)[] QuestionSeeds =
    [
        ("N1", "Negocio y cliente",
            "¿Impacta directamente clientes, comercios aliados o canales digitales?", 2),
        ("N2", "Negocio y cliente",
            "¿Soporta una capacidad crítica del negocio (originación, pagos, tarjetas, crédito, cartera o recaudo)?", 3),
        ("N3", "Negocio y cliente",
            "¿Tiene fecha comprometida por negocio, campaña, aliado, regulador o auditoría?", 2),
        ("N4", "Negocio y cliente",
            "¿Cuántas áreas de negocio u operación deben coordinarse?", 1),

        ("F1", "Alcance funcional",
            "¿Crea una capacidad nueva y no solo modifica una existente?", 3),
        ("F2", "Alcance funcional",
            "¿Cuántos canales o frontales impacta (App, web, portal, contact center, backoffice)?", 2),
        ("F3", "Alcance funcional",
            "¿Incluye reglas de negocio complejas, parametrización o flujos de aprobación?", 2),
        ("F4", "Alcance funcional",
            "¿Requiere trazabilidad, reversos, conciliación o auditoría funcional?", 3),

        ("I1", "Integraciones",
            "¿Cuántos sistemas internos deben integrarse o modificarse?", 3),
        ("I2", "Integraciones",
            "¿Cuántos terceros externos involucra (aliados, bureaus, pasarelas, core, antifraude)?", 3),
        ("I3", "Integraciones",
            "¿Cuántas APIs o integraciones nuevas/cambios requiere (APIM, eventos, mensajería)?", 2),
        ("I4", "Integraciones",
            "¿De cuántos equipos externos a la célula depende?", 2),

        ("S1", "Datos, seguridad y cumplimiento",
            "¿Procesa datos personales, financieros, transaccionales o sensibles?", 3),
        ("S2", "Datos, seguridad y cumplimiento",
            "¿Está expuesta a internet o a canales de cliente/aliado?", 3),
        ("S3", "Datos, seguridad y cumplimiento",
            "¿Requiere controles de identidad, autorización, roles, MFA o segregación?", 2),
        ("S4", "Datos, seguridad y cumplimiento",
            "¿Puede generar impacto de fraude, pérdida económica, reputacional o sanción?", 3),
        ("S5", "Datos, seguridad y cumplimiento",
            "¿Requiere evidencia para auditoría, cumplimiento o trazabilidad regulatoria?", 2),

        ("T1", "Tecnología y arquitectura",
            "¿Introduce tecnología, patrón o componente nuevo para TI?", 3),
        ("T2", "Tecnología y arquitectura",
            "¿Modifica arquitectura transversal, APIs comunes, plataforma o capacidades compartidas?", 3),
        ("T3", "Tecnología y arquitectura",
            "¿Exige alta disponibilidad, resiliencia, performance o escalabilidad relevante?", 3),
        ("T4", "Tecnología y arquitectura",
            "¿Requiere diseño de datos complejo, migración, sincronización o consistencia?", 2),
        ("T5", "Tecnología y arquitectura",
            "¿Requiere automatización CI/CD, cloud, Kubernetes, APIM, colas o IaC?", 2),

        ("O1", "Operación y soporte",
            "¿Impacta operación 7x24, mesa de servicio, backoffice o soporte?", 2),
        ("O2", "Operación y soporte",
            "¿Requiere observabilidad, alertas, métricas, SLI/SLO o trazabilidad técnica nueva?", 2),
        ("O3", "Operación y soporte",
            "¿Un error en producción afecta continuidad, recaudo, pagos, crédito o atención?", 3),
        ("O4", "Operación y soporte",
            "¿Requiere despliegue gradual, rollback, feature flags o migración controlada?", 2),

        ("D1", "Incertidumbre y dependencias",
            "¿El requerimiento aún es ambiguo o requiere discovery funcional/técnico?", 2),
        ("D2", "Incertidumbre y dependencias",
            "¿Hay dependencias con proveedores, áreas internas o decisiones no confirmadas?", 2),
        ("D3", "Incertidumbre y dependencias",
            "¿Cambia procesos, roles operativos o requiere gestión del cambio?", 1),
        ("D4", "Incertidumbre y dependencias",
            "¿Hay restricciones fuertes de tiempo, capacidad o coexistencia con otros proyectos?", 2),
    ];
}
