import type {
  ExpertiseLineDetailDto,
  ExpertiseLineDto,
  LineCapacityDto,
  LinePersonDto,
  RosterPersonDto,
} from "../services/expertiseLinesService";

/** Un decimal, igual que el resto de la app muestra el FTE. */
export function formatFte(value: number): string {
  return value.toFixed(1);
}

export interface LineListItemView {
  id: string;
  name: string;
  code: string;
  description: string | null;
  archived: boolean;
  leadName: string | null;
  peopleCount: number;
  availableFte: number;
  availableFteLabel: string;
  /**
   * Una línea vigente sin lead: no tiene quién responda por ella. Una archivada
   * no se marca — ya no tiene de qué responder.
   */
  incomplete: boolean;
}

export interface LinesIndexView {
  active: LineListItemView[];
  archived: LineListItemView[];
  /** Sin ninguna línea, la pantalla explica qué son en vez de mostrar dos listas vacías. */
  empty: boolean;
}

function toListItem(dto: ExpertiseLineDto): LineListItemView {
  const archived = dto.status === "Archived";
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    description: dto.description,
    archived,
    leadName: dto.lead?.name ?? null,
    peopleCount: dto.peopleCount,
    availableFte: dto.availableFte,
    availableFteLabel: formatFte(dto.availableFte),
    incomplete: !archived && dto.lead === null,
  };
}

export function toLinesIndex(
  dtos: ExpertiseLineDto[],
  search = ""
): LinesIndexView {
  const term = search.trim().toLowerCase();
  const matches = (l: LineListItemView) =>
    term.length === 0 ||
    l.name.toLowerCase().includes(term) ||
    l.code.toLowerCase().includes(term);

  const items = dtos
    .map(toListItem)
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    active: items.filter((l) => !l.archived).filter(matches),
    archived: items.filter((l) => l.archived).filter(matches),
    empty: dtos.length === 0,
  };
}

export interface LinePersonView {
  id: string;
  name: string;
  position: string;
  seniorityLabel: string;
  seniority: number;
  availableFteLabel: string;
  isLead: boolean;
  squadName: string | null;
  /** "80 % en Canales Digitales" o "Sin célula". */
  allocationLabel: string;
}

function toPersonView(dto: LinePersonDto): LinePersonView {
  return {
    id: dto.id,
    name: dto.name,
    position: dto.position,
    seniority: dto.seniority,
    seniorityLabel: dto.seniorityLabel,
    availableFteLabel: formatFte(dto.availableFte),
    isLead: dto.isLead,
    squadName: dto.allocation?.squadName ?? null,
    allocationLabel: dto.allocation
      ? `${dto.allocation.dedicationPercentage} % en ${dto.allocation.squadName}`
      : "Sin célula",
  };
}

export interface LineCapacityView {
  peopleCount: number;
  availableFteLabel: string;
  allocatedFteLabel: string;
  freeFteLabel: string;
  unallocatedPercentage: number;
  /**
   * El asignado por encima del disponible. Pasa con gente de FTE parcial al
   * 100 % de dedicación: es el criterio heredado de la Torre de control, así
   * que la pantalla lo señala en vez de disimularlo.
   */
  overAllocated: boolean;
}

function toCapacityView(dto: LineCapacityDto): LineCapacityView {
  return {
    peopleCount: dto.peopleCount,
    availableFteLabel: formatFte(dto.availableFte),
    allocatedFteLabel: formatFte(dto.allocatedFte),
    freeFteLabel: formatFte(dto.freeFte),
    unallocatedPercentage: dto.unallocatedPercentage,
    overAllocated: dto.allocatedFte > dto.availableFte,
  };
}

export interface LineDetailView extends LineListItemView {
  leadId: string | null;
  people: LinePersonView[];
  capacity: LineCapacityView;
  /** Sin gente, el listado muestra su estado vacío en vez de una tabla sin filas. */
  hasPeople: boolean;
  /** Sólo una línea vacía se puede archivar. */
  canArchive: boolean;
}

export function toLineDetail(dto: ExpertiseLineDetailDto): LineDetailView {
  return {
    ...toListItem(dto),
    leadId: dto.lead?.id ?? null,
    people: dto.people.map(toPersonView),
    capacity: toCapacityView(dto.capacity),
    hasPeople: dto.people.length > 0,
    canArchive: dto.status === "Active" && dto.people.length === 0,
  };
}

export interface RosterPersonView {
  id: string;
  name: string;
  position: string;
  seniorityLabel: string;
  availableFteLabel: string;
  /** El nombre de su línea, o `null` si no tiene. */
  lineName: string | null;
  lineId: string | null;
}

export interface UnassignedPeopleView {
  people: RosterPersonView[];
  count: number;
  /** Nadie sin línea se dice explícitamente; una lista vacía no comunica nada. */
  allAssigned: boolean;
}

function toRosterPerson(dto: RosterPersonDto): RosterPersonView {
  return {
    id: dto.id,
    name: dto.name,
    position: dto.position,
    seniorityLabel: dto.seniorityLabel,
    availableFteLabel: formatFte(dto.availableFte),
    lineName: dto.line?.name ?? null,
    lineId: dto.line?.id ?? null,
  };
}

/** Quién está sin línea: el trabajo que la pantalla tiene pendiente. */
export function toUnassignedPeople(
  roster: RosterPersonDto[]
): UnassignedPeopleView {
  const people = roster.filter((p) => p.line === null).map(toRosterPerson);
  return {
    people,
    count: people.length,
    allAssigned: people.length === 0,
  };
}

/**
 * A quién se puede asignar a esta línea: todo el mundo menos quien ya está en
 * ella. Los de otra línea se conservan con el nombre de esa línea, porque el
 * selector tiene que avisar de dónde saldrían antes de confirmar.
 */
export function toAssignCandidates(
  roster: RosterPersonDto[],
  lineId: string
): RosterPersonView[] {
  return roster
    .filter((p) => p.line?.id !== lineId)
    .map(toRosterPerson)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Quién se puede designar lead. Quien ya lidera otra línea aparece, pero
 * bloqueado y diciendo cuál: ocultarlo dejaría al usuario buscando a alguien
 * que sí está registrado.
 */
export interface LeadCandidateView {
  id: string;
  name: string;
  position: string;
  disabled: boolean;
  /** "Lidera Backend" cuando está bloqueado. */
  note: string | null;
}

export function toLeadCandidates(
  people: { id: string; name: string; position: string }[],
  lines: ExpertiseLineDto[],
  currentLineId: string
): LeadCandidateView[] {
  const ledBy = new Map(
    lines
      .filter((l) => l.lead && l.id !== currentLineId)
      .map((l) => [l.lead!.id, l.name])
  );
  return people
    .map((p) => {
      const other = ledBy.get(p.id);
      return {
        id: p.id,
        name: p.name,
        position: p.position,
        disabled: other !== undefined,
        note: other ? `Lidera ${other}` : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
