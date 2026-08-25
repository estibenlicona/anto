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

export interface Squad {
  id: string;
  name: string;
  team: string;
  criticality: Criticality;
  criticalityLabel: string;
  description: string;
  memberCount: number;
  members: SquadMemberSampleDto[];
  allocatedFte: number;
  bauFte: number;
  transformationFte: number;
  peopleAvailableFte: number;
  activeInitiative: SquadActiveInitiativeDto | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SquadFormValues {
  name: string;
  team: string;
  criticality: Criticality | "";
  description: string;
}

export const emptySquadFormValues: SquadFormValues = {
  name: "",
  team: "",
  criticality: "",
  description: "",
};

export const squadAdapter = {
  toEntity: (dto: SquadDto): Squad => ({
    id: dto.id,
    name: dto.name,
    team: dto.team,
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
    // así que si el backend manda una, la fila se lee como "sin iniciativa"
    // antes que mostrar una etiqueta vacía: el listado no es el lugar para
    // denunciar esa inconsistencia.
    activeInitiative: dto.activeInitiative?.talla
      ? dto.activeInitiative
      : null,
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  }),

  toFormValues: (squad: Squad): SquadFormValues => ({
    name: squad.name,
    team: squad.team,
    criticality: squad.criticality,
    description: squad.description,
  }),

  toCreateRequest: (values: SquadFormValues): CreateSquadRequest => ({
    name: values.name.trim(),
    team: values.team.trim(),
    criticality: values.criticality as Criticality,
    description: values.description.trim() || undefined,
  }),

  toUpdateRequest: (values: SquadFormValues): UpdateSquadRequest =>
    squadAdapter.toCreateRequest(values),
};
