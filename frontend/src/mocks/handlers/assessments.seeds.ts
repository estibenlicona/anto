import type { SkillLevel } from "@features/skills/services/skillsService";

/**
 * Evaluaciones de ejemplo. Los roles son distintos a propósito: la misma
 * habilidad tiene niveles esperados distintos entre personas, que es lo que
 * hace que la matriz del span no se pueda leer con un solo umbral.
 *
 * Paula queda en Competente en "Conocimiento del negocio" y su rol de Data
 * Engineer pide Avanzado: es exactamente el caso del artboard aprobado, con
 * los dos primeros criterios de Avanzado marcados y los cuatro restantes como
 * contenido de la brecha.
 */

export const PAULA = "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
export const CARLOS = "p3333333-3333-3333-3333-333333333333";
export const MARIA = "p1111111-1111-1111-1111-111111111111";
export const LAURA = "p2222222-2222-2222-2222-222222222222";

const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const DESARROLLO = "s1000000-0000-0000-0000-000000000002";
const CICLO = "s1000000-0000-0000-0000-000000000003";
const CALIDAD = "s1000000-0000-0000-0000-000000000004";
const ARQUITECTURA = "s1000000-0000-0000-0000-000000000005";
const PENSAMIENTO = "s2000000-0000-0000-0000-000000000001";
const COMUNICACION = "s2000000-0000-0000-0000-000000000002";
const COLABORATIVO = "s2000000-0000-0000-0000-000000000003";
const ADAPTABILIDAD = "s2000000-0000-0000-0000-000000000004";

export interface SeedSkill {
  skillId: string;
  level: SkillLevel;
  /**
   * Cuántos criterios se marcan de cada nivel, de arriba hacia abajo de la
   * lista. Se expresa como cantidad y no como textos para que la semilla no
   * repita el catálogo y no pueda quedar desalineada con él.
   */
  metCounts: [number, number, number, number];
  note: string;
}

export interface AssessmentSeed {
  id: string;
  personId: string;
  closed: boolean;
  /**
   * Cuántos ciclos atrás quedó esta evaluación. Ausente o `0` es el ciclo
   * vigente — el estado de hoy.
   *
   * Existe para que la variación del mapa de competencias compare contra algo
   * medido y no contra un número inventado. Una evaluación vieja NO SHALL
   * pisar la vigente: quien lee "el nivel de esta persona" toma la del ciclo
   * más reciente, no la última del arreglo.
   */
  cyclesAgo?: number;
  /** Sólo las habilidades recorridas; el resto queda sin nivel. */
  skills: SeedSkill[];
}

/** Todos los criterios de los niveles que la persona ya superó. */
const full = (
  level: SkillLevel,
  rest: [number, number, number, number]
): [number, number, number, number] => {
  const counts = [...rest] as [number, number, number, number];
  for (let i = 0; i < level - 1; i++) counts[i] = 99;
  return counts;
};

export const assessmentSeeds: AssessmentSeed[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    personId: PAULA,
    closed: true,
    skills: [
      {
        skillId: NEGOCIO,
        level: 2,
        // Nivel 2 completo, y de Avanzado sólo los dos primeros: los cuatro
        // que quedan son el contenido de la brecha del artboard.
        metCounts: full(2, [0, 5, 2, 0]),
        note: "Le falta anticipar impacto sin que se lo pidan y conocer un segundo dominio. Trabajarlo con acompañamiento en la célula de Originación.",
      },
      {
        skillId: DESARROLLO,
        level: 3,
        metCounts: full(3, [0, 0, 6, 1]),
        note: "",
      },
      { skillId: CICLO, level: 2, metCounts: full(2, [0, 5, 1, 0]), note: "" },
      {
        skillId: CALIDAD,
        level: 2,
        metCounts: full(2, [0, 5, 0, 0]),
        note: "",
      },
      {
        skillId: ARQUITECTURA,
        level: 1,
        metCounts: full(1, [4, 2, 0, 0]),
        note: "Todavía no toma decisiones de estructura por su cuenta; la exigencia de su rol es Competente.",
      },
      {
        skillId: PENSAMIENTO,
        level: 3,
        metCounts: full(3, [0, 0, 5, 0]),
        note: "",
      },
      {
        skillId: COMUNICACION,
        level: 2,
        metCounts: full(2, [0, 5, 1, 0]),
        note: "",
      },
      {
        skillId: COLABORATIVO,
        level: 3,
        metCounts: full(3, [0, 0, 6, 0]),
        note: "",
      },
      {
        skillId: ADAPTABILIDAD,
        level: 2,
        metCounts: full(2, [0, 4, 1, 0]),
        note: "",
      },
    ],
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    personId: CARLOS,
    closed: true,
    skills: [
      {
        skillId: NEGOCIO,
        level: 4,
        metCounts: full(4, [0, 0, 0, 4]),
        note: "",
      },
      {
        skillId: DESARROLLO,
        level: 4,
        metCounts: full(4, [0, 0, 0, 5]),
        note: "",
      },
      // Dos brechas más, y una de ellas de dos niveles: el chapter necesita
      // tener al menos una brecha crítica y una persona con tres brechas, o los
      // indicadores de la pantalla no se pueden ver funcionando.
      { skillId: CICLO, level: 2, metCounts: full(2, [0, 5, 1, 0]), note: "Su rol pide Avanzado: participa del ciclo pero todavía no lo ordena." },
      {
        skillId: CALIDAD,
        level: 1,
        metCounts: full(1, [4, 1, 0, 0]),
        note: "Su rol pide Avanzado y está en Principiante: dos niveles, que no se cierran acompañando en la operación.",
      },
      {
        skillId: ARQUITECTURA,
        level: 4,
        metCounts: full(4, [0, 0, 0, 4]),
        note: "",
      },
      {
        skillId: PENSAMIENTO,
        level: 4,
        metCounts: full(4, [0, 0, 0, 5]),
        note: "",
      },
      {
        skillId: COMUNICACION,
        level: 2,
        metCounts: full(2, [0, 5, 1, 0]),
        note: "Su rol pide Avanzado: le cuesta sostener una propuesta cuando la discusión se tensa. Es su brecha principal.",
      },
      {
        skillId: COLABORATIVO,
        level: 3,
        metCounts: full(3, [0, 0, 6, 0]),
        note: "",
      },
      {
        skillId: ADAPTABILIDAD,
        level: 3,
        metCounts: full(3, [0, 0, 4, 0]),
        note: "",
      },
    ],
  },
  {
    id: "e1000000-0000-0000-0000-000000000003",
    personId: MARIA,
    closed: true,
    skills: [
      {
        skillId: NEGOCIO,
        level: 2,
        metCounts: full(2, [0, 5, 2, 0]),
        note: "",
      },
      {
        skillId: DESARROLLO,
        level: 2,
        metCounts: full(2, [0, 6, 3, 0]),
        note: "Su rol pide Avanzado. Ya diseña historias completas; le falta volver la deuda técnica trabajo priorizable y definir contratos de integración.",
      },
      { skillId: CICLO, level: 2, metCounts: full(2, [0, 5, 0, 0]), note: "" },
      {
        skillId: CALIDAD,
        level: 2,
        metCounts: full(2, [0, 5, 1, 0]),
        note: "",
      },
      {
        skillId: ARQUITECTURA,
        level: 2,
        metCounts: full(2, [0, 5, 0, 0]),
        note: "",
      },
      {
        skillId: PENSAMIENTO,
        level: 2,
        metCounts: full(2, [0, 5, 2, 0]),
        note: "",
      },
      {
        skillId: COMUNICACION,
        level: 3,
        metCounts: full(3, [0, 0, 4, 0]),
        note: "",
      },
      {
        skillId: COLABORATIVO,
        level: 2,
        metCounts: full(2, [0, 5, 2, 0]),
        note: "",
      },
      {
        skillId: ADAPTABILIDAD,
        level: 2,
        metCounts: full(2, [0, 4, 0, 0]),
        note: "",
      },
    ],
  },
  {
    // A medio recorrer: cuatro de nueve, para que el índice muestre avance
    // real y el cierre incompleto se pueda ejercitar sin preparar nada.
    id: "e1000000-0000-0000-0000-000000000004",
    personId: LAURA,
    closed: false,
    skills: [
      {
        skillId: NEGOCIO,
        level: 2,
        metCounts: full(2, [0, 5, 1, 0]),
        note: "",
      },
      {
        skillId: CALIDAD,
        level: 3,
        metCounts: full(3, [0, 0, 5, 1]),
        note: "Su rol pide Experto. Le falta que su criterio decida si algo sale a producción.",
      },
      {
        skillId: PENSAMIENTO,
        level: 3,
        metCounts: full(3, [0, 0, 5, 0]),
        note: "",
      },
      {
        skillId: COMUNICACION,
        level: 2,
        metCounts: full(2, [0, 5, 0, 0]),
        note: "",
      },
    ],
  },
  // Andrés Martínez (Frontend Dev) queda sin evaluar a propósito.

  // ── Historial ───────────────────────────────────────────────────────────
  //
  // Dos ciclos anteriores de Paula y Carlos, un nivel por debajo en las
  // habilidades donde hoy tienen brecha. No es decorado: es lo que hace que
  // "vs. el ciclo anterior" compare contra algo medido. Se mantiene corto —dos
  // personas, no el chapter entero— porque lo que se necesita es que la serie
  // tenga puntos, no que el pasado esté completo.
  {
    id: "e1000000-0000-0000-0000-0000000000h1",
    personId: PAULA,
    closed: true,
    cyclesAgo: 1,
    skills: [
      { skillId: NEGOCIO, level: 1, metCounts: full(1, [4, 1, 0, 0]), note: "" },
      {
        skillId: DESARROLLO,
        level: 2,
        metCounts: full(2, [0, 5, 1, 0]),
        note: "",
      },
      { skillId: CICLO, level: 2, metCounts: full(2, [0, 4, 0, 0]), note: "" },
      { skillId: CALIDAD, level: 1, metCounts: full(1, [4, 0, 0, 0]), note: "" },
      {
        skillId: ARQUITECTURA,
        level: 1,
        metCounts: full(1, [3, 0, 0, 0]),
        note: "",
      },
    ],
  },
  {
    id: "e1000000-0000-0000-0000-0000000000h2",
    personId: CARLOS,
    closed: true,
    cyclesAgo: 1,
    skills: [
      {
        skillId: ARQUITECTURA,
        level: 2,
        metCounts: full(2, [0, 4, 0, 0]),
        note: "",
      },
      { skillId: CALIDAD, level: 2, metCounts: full(2, [0, 4, 0, 0]), note: "" },
      {
        skillId: COMUNICACION,
        level: 1,
        metCounts: full(1, [4, 0, 0, 0]),
        note: "",
      },
    ],
  },
  {
    id: "e1000000-0000-0000-0000-0000000000h3",
    personId: PAULA,
    closed: true,
    cyclesAgo: 2,
    skills: [
      { skillId: NEGOCIO, level: 1, metCounts: full(1, [3, 0, 0, 0]), note: "" },
      {
        skillId: DESARROLLO,
        level: 1,
        metCounts: full(1, [4, 0, 0, 0]),
        note: "",
      },
      { skillId: CICLO, level: 1, metCounts: full(1, [4, 0, 0, 0]), note: "" },
      { skillId: CALIDAD, level: 1, metCounts: full(1, [3, 0, 0, 0]), note: "" },
      {
        skillId: ARQUITECTURA,
        level: 1,
        metCounts: full(1, [2, 0, 0, 0]),
        note: "",
      },
    ],
  },
];
