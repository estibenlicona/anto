import {
  GROUP_LABELS,
  levelLabel,
} from "@features/skills/adapters/SkillsAdapter";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";
import type {
  SpanCellDto,
  SpanMatrixDto,
  SpanSkillDto,
} from "../services/careerPlanService";

/**
 * Cómo se lee una celda. Se separa del número de la brecha porque "sin
 * evaluar", "sin nivel declarado" y "al nivel" son tres hechos distintos que
 * un cero no distingue.
 */
export type CellState = "unevaluated" | "undefined" | "met" | "gap";

/**
 * Cuánta atención pide la celda, en los pasos que publica el sistema de
 * diseño. Sale de cuántos niveles faltan y no del nivel alcanzado: el mapa
 * responde dónde enfocarse, no quién sabe más.
 */
export type AttentionStep = "low" | "medium" | "high";

export interface SpanCellView {
  skillId: string;
  skillName: string;
  level: SkillLevel | null;
  levelLabel: string | null;
  expectedLevel: SkillLevel | null;
  expectedLabel: string | null;
  gap: number | null;
  state: CellState;
  /** El paso de la escala de atención; `null` cuando la celda no es brecha. */
  attention: AttentionStep | null;
  /**
   * Está por encima de lo que su cargo pide. Es un hecho de la celda, no un
   * color: en el mapa se ve igual que estar justo al nivel, y la diferencia
   * se dice en el detalle. Un color para "va sobrado" competiría con el rojo.
   */
  exceeds: boolean;
  /**
   * Personas del span con brecha en esta misma habilidad. Sale del mismo
   * cálculo que el pie de la columna, y no de uno propio: si el detalle
   * recontara, el número del panel y el del pie podrían discrepar.
   */
  columnGapCount: number;
  /** Lo que un lector de pantalla necesita para entender la celda sola. */
  description: string;
}

export interface SpanPersonView {
  personId: string;
  personName: string;
  initials: string;
  position: string;
  evaluated: boolean;
  cells: SpanCellView[];
  /** Brechas de esta persona entre las habilidades visibles. */
  gapCount: number;
}

export interface SpanSkillView extends SpanSkillDto {
  groupLabel: string;
  /** Personas con brecha en esta habilidad, entre las evaluadas. */
  gapCount: number;
}

export interface SpanMatrixView {
  skills: SpanSkillView[];
  people: SpanPersonView[];
  /** Suma de las brechas visibles. */
  totalGaps: number;
  evaluatedCount: number;
  pendingCount: number;
  /** Nombres de quienes faltan evaluar, para poder decir quiénes. */
  pendingNames: string[];
  empty: boolean;
  /** Las columnas visibles son menos que las del catálogo. */
  narrowed: boolean;
  totalSkills: number;
}

export type SpanSort = "gaps" | "name";

export interface SpanOptions {
  /** Grupos visibles; vacío es "todos". */
  groups?: SkillGroup[];
  /** Ids de habilidad visibles; vacío es "todas las de los grupos elegidos". */
  skillIds?: string[];
  sort?: SpanSort;
}

function stateOf(cell: SpanCellDto): CellState {
  if (cell.level === null) return "unevaluated";
  if (cell.expectedLevel === null) return "undefined";
  return (cell.gap ?? 0) > 0 ? "gap" : "met";
}

/**
 * Con cuatro niveles, la brecha va de 1 a 3, así que cada paso de la escala
 * tiene su tamaño de brecha. La escala no tiene un cuarto paso para "está en
 * orden" a propósito: eso va en la familia neutra.
 */
function attentionOf(
  state: CellState,
  gap: number | null
): AttentionStep | null {
  if (state !== "gap") return null;
  if ((gap ?? 0) >= 3) return "high";
  return (gap ?? 0) === 2 ? "medium" : "low";
}

/**
 * El cuadro sólo comunica por color, así que su nombre accesible tiene que
 * decir la celda entera: de quién es, de qué habilidad y en qué situación
 * está. Sin la persona, una fila de nueve cuadros se anuncia como nueve
 * situaciones sin dueño.
 */
function describe(
  cell: SpanCellDto,
  state: CellState,
  skillName: string,
  personName: string,
  exceeds: boolean
): string {
  const head = `${personName}, ${skillName}`;
  switch (state) {
    case "unevaluated":
      return `${head}: sin evaluar`;
    case "undefined":
      return `${head}: ${levelLabel(cell.level!)}, su cargo no declara nivel`;
    case "met":
      return exceeds
        ? `${head}: ${levelLabel(cell.level!)}, por encima de ${levelLabel(
            cell.expectedLevel!
          )}, que es lo que pide su cargo`
        : `${head}: ${levelLabel(cell.level!)}, al nivel que pide su cargo`;
    case "gap":
      return `${head}: ${levelLabel(cell.level!)}, le ${
        cell.gap === 1 ? "falta 1 nivel" : `faltan ${cell.gap} niveles`
      } para ${levelLabel(cell.expectedLevel!)}`;
  }
}

const GROUP_ORDER: SkillGroup[] = ["technical", "human"];

/**
 * Qué columnas quedan visibles. Acotar es de la pantalla, no del dato: los
 * totales se recalculan sobre lo visible y la pantalla lo dice, para que un
 * total parcial no se lea como el total del span.
 */
function visibleSkills(
  skills: SpanSkillDto[],
  options: SpanOptions
): SpanSkillDto[] {
  const byGroup =
    options.groups && options.groups.length > 0
      ? skills.filter((s) => options.groups!.includes(s.group))
      : skills;
  return options.skillIds && options.skillIds.length > 0
    ? byGroup.filter((s) => options.skillIds!.includes(s.skillId))
    : byGroup;
}

export function toSpanView(
  dto: SpanMatrixDto,
  options: SpanOptions = {}
): SpanMatrixView {
  const visible = visibleSkills(dto.skills, options);
  const visibleIds = new Set(visible.map((s) => s.skillId));

  const people: SpanPersonView[] = dto.people.map((person) => {
    const cells = person.cells
      .filter((c) => visibleIds.has(c.skillId))
      .map((cell) => {
        const state = stateOf(cell);
        const skillName =
          visible.find((s) => s.skillId === cell.skillId)?.skillName ?? "";
        const exceeds =
          cell.level !== null &&
          cell.expectedLevel !== null &&
          cell.level > cell.expectedLevel;
        return {
          skillId: cell.skillId,
          skillName,
          level: cell.level,
          levelLabel: cell.level === null ? null : levelLabel(cell.level),
          expectedLevel: cell.expectedLevel,
          expectedLabel:
            cell.expectedLevel === null ? null : levelLabel(cell.expectedLevel),
          gap: cell.gap,
          state,
          attention: attentionOf(state, cell.gap),
          exceeds,
          // Se completa abajo, cuando las columnas ya contaron sus brechas.
          columnGapCount: 0,
          description: describe(
            cell,
            state,
            skillName,
            person.personName,
            exceeds
          ),
        };
      });

    return {
      personId: person.personId,
      personName: person.personName,
      initials: getPersonInitials(person.personName),
      position: person.position,
      evaluated: person.evaluated,
      cells,
      gapCount: cells.filter((c) => c.state === "gap").length,
    };
  });

  // Sólo las evaluadas cuentan: incluir a los pendientes como si estuvieran
  // bien haría que una habilidad se viera mejor de lo que está sólo porque
  // falta evaluar gente.
  const evaluated = people.filter((p) => p.evaluated);
  const pending = people.filter((p) => !p.evaluated);

  const skills: SpanSkillView[] = visible.map((skill) => ({
    ...skill,
    groupLabel: GROUP_LABELS[skill.group],
    gapCount: evaluated.filter(
      (p) => p.cells.find((c) => c.skillId === skill.skillId)?.state === "gap"
    ).length,
  }));

  const sort = options.sort ?? "gaps";
  const orderedPeople =
    sort === "gaps"
      ? // Los pendientes van al final: no tienen brecha que ordenar, y en la
        // cabeza de la lista ocuparían el lugar de lo accionable.
        [...people].sort(
          (a, b) =>
            Number(b.evaluated) - Number(a.evaluated) ||
            b.gapCount - a.gapCount ||
            a.personName.localeCompare(b.personName, "es")
        )
      : [...people].sort((a, b) =>
          a.personName.localeCompare(b.personName, "es")
        );

  /*
    Las columnas se agrupan siempre, y el orden elegido decide qué pasa
    *dentro* de cada grupo.

    Ordenar por brechas cruzando los grupos dejaba las técnicas y las humanas
    intercaladas, y con eso la matriz no puede rotular dónde empieza cada una
    — que con siglas de dos letras es lo único que dice a qué grupo pertenece
    una columna. El grupo es una propiedad de la habilidad; la criticidad es
    una lectura sobre ella, y una lectura no reordena la clasificación.
  */
  const orderedSkills = [...skills].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
      (sort === "gaps" ? b.gapCount - a.gapCount : 0) ||
      a.skillName.localeCompare(b.skillName, "es")
  );

  // Las celdas siguen el orden de las columnas, no el del dato.
  const columnOrder = orderedSkills.map((s) => s.skillId);
  const gapsByColumn = new Map(
    orderedSkills.map((s) => [s.skillId, s.gapCount])
  );
  for (const person of orderedPeople) {
    person.cells = columnOrder
      .map((id) => person.cells.find((c) => c.skillId === id))
      .filter((c): c is SpanCellView => c !== undefined)
      .map((cell) => ({
        ...cell,
        columnGapCount: gapsByColumn.get(cell.skillId) ?? 0,
      }));
  }

  return {
    skills: orderedSkills,
    people: orderedPeople,
    totalGaps: evaluated.reduce((total, p) => total + p.gapCount, 0),
    evaluatedCount: evaluated.length,
    pendingCount: pending.length,
    pendingNames: pending.map((p) => p.personName),
    empty: evaluated.length === 0,
    narrowed: visible.length < dto.skills.length,
    totalSkills: dto.skills.length,
  };
}

/** Cómo se llama lo que falta evaluar, sin repetir la cifra al lado. */
export function pendingLabel(view: SpanMatrixView): string | null {
  if (view.pendingCount === 0) return null;
  return view.pendingCount === 1
    ? `1 persona sin evaluar, que no cuenta en los totales`
    : `${view.pendingCount} personas sin evaluar, que no cuentan en los totales`;
}
