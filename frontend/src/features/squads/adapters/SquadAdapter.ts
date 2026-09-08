import type {
  CreateSquadRequest,
  Criticality,
  SquadDto,
  SquadMemberSampleDto,
  SquadActiveInitiativeDto,
  UpdateSquadRequest,
} from "../services/squadService";

// Etiquetas en español de la criticidad. El catálogo real devuelve códigos
// (`Critical`…) sin etiqueta, así que la UI es la dueña de este mapa: lo usan
// el badge del listado, el filtro, el selector del formulario y la leyenda de
// la card de distribución. Hacia el backend siempre viaja el código.
export const CRITICALITY_LABELS: Record<Criticality, string> = {
  Critical: "Crítica",
  High: "Alta",
  Medium: "Media",
  Low: "Baja",
};

// Es una escala, no categorías sueltas: filtro, formulario y leyenda la
// presentan siempre en este orden.
export const CRITICALITY_ORDER: Criticality[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

/**
 * El estado de asignación de la célula: su FTE asignado comparado con la
 * demanda de sus iniciativas activas (la suma de los rangos FTE mín–máx que
 * salieron de la evaluación de cada una). El veredicto se deriva acá y no en
 * el servidor: el contrato transporta los rangos crudos por iniciativa, así el
 * criterio vive en un solo lugar con sus tests.
 */
export type SquadAssignmentStatus =
  | { kind: "sin-demanda" }
  | {
      kind: "sub" | "en-rango" | "sobre";
      demandMin: number;
      demandMax: number;
      /** Cuánto falta (sub) o sobra (sobre), ya redondeado; 0 en rango. */
      deltaFte: number;
    };

/** Redondeo a un decimal para mostrar, el mismo criterio que el resto de la fila. */
const round1 = (value: number): number => Math.round(value * 10) / 10;

/**
 * Sub si la cobertura no llega ni al mínimo de la demanda; sobre si supera el
 * máximo (el excedente se lee como BAU); los extremos pertenecen al rango. La
 * comparación usa los valores sin redondear; sólo las cifras que se muestran
 * se redondean.
 */
export function deriveAssignmentStatus(
  allocatedFte: number,
  actives: SquadActiveInitiativeDto[]
): SquadAssignmentStatus {
  if (actives.length === 0) return { kind: "sin-demanda" };
  const demandMin = actives.reduce((sum, i) => sum + i.fteMin, 0);
  const demandMax = actives.reduce((sum, i) => sum + i.fteMax, 0);
  const kind =
    allocatedFte < demandMin
      ? "sub"
      : allocatedFte > demandMax
        ? "sobre"
        : "en-rango";
  const delta =
    kind === "sub"
      ? demandMin - allocatedFte
      : kind === "sobre"
        ? allocatedFte - demandMax
        : 0;
  return {
    kind,
    demandMin: round1(demandMin),
    demandMax: round1(demandMax),
    deltaFte: round1(delta),
  };
}

export interface Squad {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  criticality: Criticality;
  criticalityLabel: string;
  description: string;
  memberCount: number;
  members: SquadMemberSampleDto[];
  allocatedFte: number;
  bauFte: number;
  transformationFte: number;
  peopleAvailableFte: number;
  activeInitiatives: SquadActiveInitiativeDto[];
  assignmentStatus: SquadAssignmentStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SquadFormValues {
  name: string;
  teamId: string;
  criticality: Criticality | "";
  description: string;
}

export const emptySquadFormValues: SquadFormValues = {
  name: "",
  teamId: "",
  criticality: "",
  description: "",
};

export const squadAdapter = {
  toEntity: (dto: SquadDto): Squad => ({
    id: dto.id,
    name: dto.name,
    teamId: dto.teamId,
    teamName: dto.teamName,
    criticality: dto.criticality,
    criticalityLabel: CRITICALITY_LABELS[dto.criticality] ?? dto.criticality,
    description: dto.description ?? "",
    // Los `??` tapan la brecha del backend real, que todavía no devuelve los
    // campos calculados: la tabla muestra "Sin personas" y 0.0 FTE en vez de
    // romper.
    memberCount: dto.memberCount ?? 0,
    members: dto.members ?? [],
    allocatedFte: dto.allocatedFte ?? 0,
    bauFte: dto.bauFte ?? 0,
    transformationFte: dto.transformationFte ?? 0,
    peopleAvailableFte: dto.peopleAvailableFte ?? 0,
    // Una activa sin talla no debería existir —sólo se activa lo evaluado—,
    // así que si el backend manda una, se omite de la fila antes que mostrar
    // una etiqueta vacía o inventarle demanda: el listado no es el lugar para
    // denunciar esa inconsistencia. El `?? []` tapa la brecha del backend
    // real, como el resto de los campos calculados.
    activeInitiatives: (dto.activeInitiatives ?? []).filter((i) => i.talla),
    assignmentStatus: deriveAssignmentStatus(
      dto.allocatedFte ?? 0,
      (dto.activeInitiatives ?? []).filter((i) => i.talla)
    ),
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  }),

  toFormValues: (squad: Squad): SquadFormValues => ({
    name: squad.name,
    teamId: squad.teamId,
    criticality: squad.criticality,
    description: squad.description,
  }),

  toCreateRequest: (values: SquadFormValues): CreateSquadRequest => ({
    name: values.name.trim(),
    teamId: values.teamId,
    criticality: values.criticality as Criticality,
    description: values.description.trim() || undefined,
  }),

  toUpdateRequest: (values: SquadFormValues): UpdateSquadRequest =>
    squadAdapter.toCreateRequest(values),
};
