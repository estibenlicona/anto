import type {
  CreatePersonRequest,
  Modality,
  PersonDto,
  PersonRole,
  PersonStackDto,
  Seniority,
  UpdatePersonRequest,
} from "../services/personService";

export interface Person {
  id: string;
  name: string;
  documentId: string;
  userPrincipalName: string;
  position: string;
  role: PersonRole;
  /** Informativo: acompaña, no decide qué ve nadie. `null` = sin asignar. */
  technicalLeadId: string | null;
  technicalLeadName: string | null;
  /** De cuántas personas es líder técnico; sólo lectura. */
  technicalLeadOfCount: number;
  seniority: Seniority;
  seniorityLabel: string;
  modality: Modality;
  availableFte: number;
  /** Porcentaje calculado de utilización de la capacidad (0–100+), sólo lectura. */
  utilization: number;
  /** Stacks que domina, con el principal primero. */
  stacks: PersonStackDto[];
  monthlyCost: number;
  startDate: string;
  providerId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface PersonFormValues {
  name: string;
  documentId: string;
  userPrincipalName: string;
  position: string;
  /** Valor del catálogo; vacío mientras no se eligió. */
  role: PersonRole | "";
  /** Id de la persona elegida como líder técnico; vacío = sin asignar. */
  technicalLeadId: string;
  seniority: string;
  modality: Modality | "";
  availableFte: string;
  monthlyCost: string;
  startDate: string;
  isExternal: boolean;
  providerId: string;
}

export const emptyPersonFormValues: PersonFormValues = {
  name: "",
  documentId: "",
  userPrincipalName: "",
  position: "",
  role: "",
  technicalLeadId: "",
  seniority: "",
  modality: "",
  availableFte: "",
  monthlyCost: "",
  startDate: "",
  isExternal: false,
  providerId: "",
};

// Deriva "primer nombre + primer apellido" separando por espacios; el DTO no
// distingue nombres de apellidos, así que en nombres de 3+ tokens toma el
// primero y el segundo tal cual (ver design.md - Decisions).
export function getPersonInitials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");
}

export const personAdapter = {
  toEntity: (dto: PersonDto): Person => ({
    id: dto.id,
    name: dto.name,
    documentId: dto.documentId,
    userPrincipalName: dto.userPrincipalName,
    position: dto.position,
    role: dto.role,
    technicalLeadId: dto.technicalLeadId,
    technicalLeadName: dto.technicalLeadName,
    technicalLeadOfCount: dto.technicalLeadOfCount,
    seniority: dto.seniority,
    seniorityLabel: dto.seniorityLabel,
    modality: dto.modality,
    availableFte: dto.availableFte,
    utilization: dto.utilization,
    stacks: [...(dto.stacks ?? [])].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary)
    ),
    monthlyCost: dto.monthlyCost,
    startDate: dto.startDate,
    providerId: dto.providerId,
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  }),

  // La derivación de isExternal a partir de providerId es la única fuente:
  // no hay un campo "externo" propio en el backend, sólo un proveedor
  // presente o ausente.
  toFormValues: (person: Person): PersonFormValues => ({
    name: person.name,
    documentId: person.documentId,
    userPrincipalName: person.userPrincipalName,
    position: person.position,
    role: person.role,
    technicalLeadId: person.technicalLeadId ?? "",
    seniority: String(person.seniority),
    modality: person.modality,
    availableFte: String(person.availableFte),
    monthlyCost: String(person.monthlyCost),
    startDate: person.startDate,
    isExternal: person.providerId !== null,
    providerId: person.providerId ?? "",
  }),

  toCreateRequest: (values: PersonFormValues): CreatePersonRequest => ({
    name: values.name.trim(),
    documentId: values.documentId.trim(),
    // El backend real no exige EntraObjectId (no tiene validación propia) y
    // esta pantalla no lo captura — pertenece al flujo de identidad DevOps,
    // fuera de alcance (ver proposal.md).
    entraObjectId: "",
    userPrincipalName: values.userPrincipalName.trim(),
    position: values.position.trim(),
    // El rol sale de un catálogo cerrado: acá no se recorta ni se normaliza
    // texto, porque no hay texto que normalizar. La validación ya rechazó el
    // vacío.
    role: values.role as PersonRole,
    // Vacío es "sin líder técnico", que es un valor válido y no un dato que
    // falta: viaja como null y no como cadena vacía.
    technicalLeadId: values.technicalLeadId || null,
    seniority: Number(values.seniority),
    modality: values.modality as Modality,
    availableFte: Number(values.availableFte),
    monthlyCost: Number(values.monthlyCost),
    startDate: values.startDate,
  }),

  toUpdateRequest: (values: PersonFormValues): UpdatePersonRequest =>
    personAdapter.toCreateRequest(values),
};
