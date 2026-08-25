import { http, HttpResponse } from "msw";
import type {
  CompanyDto,
  CreatePersonRequest,
  Modality,
  PeopleStats,
  PersonDto,
  PersonRole,
  RoleOption,
  SeniorityOption,
  PersonStackDto,
  Seniority,
  TechnicalLeadOption,
} from "@features/people/services/personService";
import { clampPagination, paginate } from "@shared/services/pagination";
import {
  CHAPTER_BY_PERSON_NAME,
  holderChapterId,
  leadEntraObjectIdOf,
} from "./chapters";

const PEOPLE_URL = "/people";
const PEOPLE_STATS_URL = "/people/stats";
const ROLES_URL = "/catalogs/roles";
const TECHNICAL_LEADS_URL = "/people/technical-leads";
const STACKS_URL = "/people/stacks";
const PERSON_STACKS_URL = "/people/:id/stacks";

/** Catálogo de stacks del chapter (solo lectura por ahora). */
export const STACK_CATALOG = [
  ".NET",
  "Angular",
  "AS400",
  "Azure",
  "Bus de Integración",
  "Java",
  "Kafka",
  "MuleSoft",
  "Power BI",
  "Python",
  "React",
  "React Native",
  "SQL Server",
];

/**
 * Stacks de ejemplo por nombre de persona (ficción hasta que exista backend).
 * AS400 y MuleSoft los tiene una sola persona a propósito: son los de "riesgo".
 * El primero de cada lista es el principal.
 */
const STACK_SEEDS: Record<string, Array<[string, number]>> = {
  "María González": [
    [".NET", 3],
    ["Azure", 2],
    ["Kafka", 3],
    ["AS400", 2],
  ],
  "Laura Ruiz": [
    ["React", 2],
    ["Angular", 2],
    ["Azure", 1],
  ],
  "Carlos López": [
    ["Azure", 4],
    [".NET", 4],
    ["Bus de Integración", 3],
    ["Kafka", 3],
    ["SQL Server", 3],
  ],
  "Andrés Martínez": [
    ["React", 2],
    ["React Native", 2],
    [".NET", 1],
    ["Azure", 2],
  ],
  "Paula Ramírez": [
    ["Python", 4],
    ["SQL Server", 4],
    ["Power BI", 3],
    ["Azure", 3],
  ],
  "Diego Salazar": [
    [".NET", 1],
    ["SQL Server", 1],
  ],
  "Valentina Ospina": [
    ["React", 3],
    ["React Native", 2],
  ],
  "Sebastián Cárdenas": [
    ["Azure", 3],
    ["Kafka", 2],
    ["Python", 2],
  ],
  "Camila Restrepo": [["Power BI", 2]],
  "Julián Peña": [
    ["Java", 2],
    [".NET", 2],
    ["SQL Server", 2],
  ],
  "Isabella Moreno": [
    ["React", 3],
    ["Angular", 2],
    ["React Native", 3],
  ],
  "Mateo Vargas": [
    ["Python", 1],
    ["Power BI", 1],
    ["SQL Server", 1],
  ],
  "Sofía Herrera": [],
  "Tomás Giraldo": [
    ["MuleSoft", 4],
    ["Azure", 4],
    [".NET", 3],
    ["Bus de Integración", 4],
  ],
  "Daniela Castaño": [
    [".NET", 2],
    ["Azure", 2],
    ["SQL Server", 2],
  ],
  "Emilio Naranjo": [
    ["Azure", 3],
    ["Python", 2],
  ],
  "Lucía Arango": [],
  "Nicolás Betancur": [
    ["React Native", 3],
    ["React", 2],
    ["Java", 2],
  ],
};

function seedStacks(name: string): PersonStackDto[] {
  return (STACK_SEEDS[name] ?? []).map(([stack, level], i) => ({
    name: stack,
    level: level as Seniority,
    isPrimary: i === 0,
  }));
}
// Capacidad objetivo asumida por el mock — su cálculo real (por chapter,
// contratado, etc.) es responsabilidad del backend y queda fuera de alcance.
const ASSUMED_FTE_TARGET = 12;
const MODALITIES: Modality[] = ["Remote", "Hybrid", "OnSite"];
// Escala de seniority propia de Tuya (4 niveles) — es la misma escala que
// antes se llamaba "nivel SFIA"; no existe una escalera de seniority
// separada, así que ambos campos se fusionaron en uno solo.
const SENIORITY_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Competente",
  3: "Avanzado",
  4: "Experto",
};
const SENIORITIES: SeniorityOption[] = [1, 2, 3, 4].map((value) => ({
  value,
  label: SENIORITY_LABELS[value],
}));

/**
 * Cómo participa cada quien en la aplicación. Cerrado a propósito: mientras
 * el rol fue texto libre se llenó con el cargo, y con los dos campos diciendo
 * lo mismo el sistema no podía responder quién es líder técnico.
 *
 * `Contributor` es el de quien participa sin liderar. Sin él, un rol
 * obligatorio con sólo cuatro valores de liderazgo obligaría a inventarle un
 * liderazgo a la mayoría de la gente, y la pantalla lo mostraría como un
 * hecho.
 *
 * El valor viaja en inglés y se muestra en español: el mapa vive acá y no se
 * improvisa en cada pantalla.
 */
const ROLE_CATALOG: RoleOption[] = [
  { value: "Administrator", label: "Administrador" },
  { value: "TechnicalLead", label: "Líder Técnico" },
  { value: "ExpertiseLead", label: "Líder de Expertise" },
  { value: "ProductOwner", label: "Product Owner" },
  { value: "Contributor", label: "Colaborador" },
];

const ROLE_VALUES = ROLE_CATALOG.map((r) => r.value);

/**
 * El rol de cada persona sembrada, por nombre. No sale del cargo: es
 * justamente lo que este dato dejó de ser.
 *
 * Los cuatro Líderes de Expertise son los que ya lideran una línea (ver
 * expertise-lines.seeds), y hay **dos** Líderes Técnicos a propósito: con uno
 * solo el selector de líder técnico "funciona" sin probar nada. Quien no
 * lidera nada es Colaborador.
 */
const ROLE_BY_NAME: Record<string, PersonRole> = {
  "Carlos López": "TechnicalLead",
  "Tomás Giraldo": "TechnicalLead",
  "María González": "ExpertiseLead",
  "Laura Ruiz": "ExpertiseLead",
  "Paula Ramírez": "ExpertiseLead",
  "Sebastián Cárdenas": "ExpertiseLead",
  "Camila Restrepo": "ProductOwner",
};

/**
 * Quién acompaña técnicamente a quién, por nombre. Varias personas quedan sin
 * líder técnico a propósito —incluidos los propios líderes—: el campo es
 * opcional y el formulario tiene que saber decirlo.
 */
const TECHNICAL_LEAD_BY_NAME: Record<string, string> = {
  "María González": "Carlos López",
  "Diego Salazar": "Carlos López",
  "Daniela Castaño": "Carlos López",
  "Julián Peña": "Carlos López",
  "Andrés Martínez": "Tomás Giraldo",
  "Isabella Moreno": "Tomás Giraldo",
  "Nicolás Betancur": "Tomás Giraldo",
  "Mateo Vargas": "Tomás Giraldo",
};

const now = new Date().toISOString();

/** Externos de ejemplo (nombre → proveedor); el resto es interno. */
const EXTERNAL_PROVIDERS: Record<string, string> = {
  "Camila Restrepo": "c3333333-3333-3333-3333-333333333333",
  "Andrés Martínez": "c2222222-2222-2222-2222-222222222222",
  "Paula Ramírez": "c1111111-1111-1111-1111-111111111111",
};

const initialCompanies: CompanyDto[] = [
  { id: "c1111111-1111-1111-1111-111111111111", name: "GFT" },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    name: "TATA Consultancy Services",
  },
  { id: "c3333333-3333-3333-3333-333333333333", name: "QVision" },
  { id: "c4444444-4444-4444-4444-444444444444", name: "Indra" },
  { id: "c5555555-5555-5555-5555-555555555555", name: "Softtek" },
  { id: "c6666666-6666-6666-6666-666666666666", name: "Stefanini" },
];

const initialPeople: PersonDto[] = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    name: "María González",
    documentId: "1036884001",
    entraObjectId: "",
    userPrincipalName: "maria.gonzalez@tuya.com",
    position: "Backend Dev",
    role: "Contributor",
    technicalLeadId: null,
    technicalLeadName: null,
    // Derivado en la respuesta, no en el estado: ver respond().
    technicalLeadOfCount: 0,
    seniority: 3,
    seniorityLabel: "Avanzado",
    modality: "Hybrid",
    availableFte: 1,
    utilization: 40,
    monthlyCost: 7900000,
    startDate: "2023-03-01",
    chapterId: null,
    providerId: null,
    createdAtUtc: now,
    updatedAtUtc: now,
    stacks: [],
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    name: "Laura Ruiz",
    documentId: "1036884002",
    entraObjectId: "",
    userPrincipalName: "laura.ruiz@tuya.com",
    position: "QA Engineer",
    role: "Contributor",
    technicalLeadId: null,
    technicalLeadName: null,
    // Derivado en la respuesta, no en el estado: ver respond().
    technicalLeadOfCount: 0,
    seniority: 2,
    seniorityLabel: "Competente",
    modality: "Remote",
    availableFte: 1,
    utilization: 70,
    monthlyCost: 6200000,
    startDate: "2023-06-15",
    chapterId: null,
    providerId: null,
    createdAtUtc: now,
    updatedAtUtc: now,
    stacks: [],
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    name: "Carlos López",
    documentId: "1036884003",
    entraObjectId: "",
    userPrincipalName: "carlos.lopez@tuya.com",
    position: "Arquitecto",
    role: "Contributor",
    technicalLeadId: null,
    technicalLeadName: null,
    // Derivado en la respuesta, no en el estado: ver respond().
    technicalLeadOfCount: 0,
    seniority: 4,
    seniorityLabel: "Experto",
    modality: "OnSite",
    availableFte: 0.8,
    utilization: 100,
    monthlyCost: 11500000,
    startDate: "2021-01-10",
    chapterId: null,
    providerId: "c1111111-1111-1111-1111-111111111111",
    createdAtUtc: now,
    updatedAtUtc: now,
    stacks: [],
  },
  // A partir de acá, personas sumadas para tener un listado con volumen: sirven
  // para ver el reparto de colores de avatar sobre más de un puñado de filas, y
  // para que la paginación tenga más de una página con el tamaño por defecto.
  ...(
    [
      ["Andrés Martínez", "Frontend Dev", 2, "Competente", "OnSite", 60],
      ["Paula Ramírez", "Data Engineer", 4, "Experto", "Hybrid", 85],
      ["Diego Salazar", "Backend Dev", 1, "Principiante", "Remote", 0],
      ["Valentina Ospina", "UX Designer", 3, "Avanzado", "Hybrid", 40],
      ["Sebastián Cárdenas", "DevOps Engineer", 3, "Avanzado", "Remote", 120],
      ["Camila Restrepo", "Product Owner", 4, "Experto", "OnSite", 90],
      ["Julián Peña", "QA Engineer", 2, "Competente", "Hybrid", 50],
      ["Isabella Moreno", "Frontend Dev", 3, "Avanzado", "Remote", 75],
      ["Mateo Vargas", "Data Analyst", 1, "Principiante", "Hybrid", 0],
      ["Sofía Herrera", "Scrum Master", 3, "Avanzado", "OnSite", 100],
      ["Tomás Giraldo", "Arquitecto", 4, "Experto", "Hybrid", 80],
      ["Daniela Castaño", "Backend Dev", 2, "Competente", "Remote", 30],
      ["Emilio Naranjo", "Security Engineer", 3, "Avanzado", "Hybrid", 65],
      ["Lucía Arango", "UX Researcher", 2, "Competente", "Remote", 20],
      ["Nicolás Betancur", "Mobile Dev", 3, "Avanzado", "OnSite", 55],
    ] satisfies ReadonlyArray<
      readonly [string, string, number, string, PersonDto["modality"], number]
    >
  ).map(
    (
      [name, position, seniority, seniorityLabel, modality, utilization],
      index
    ) => {
      // Una letra repetida por persona, con la misma forma que los ids de arriba
      // pero sin colisionar con ellos, que usan dígitos.
      const d = String.fromCharCode(97 + index);
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        // Marcas diacríticas combinantes: las deja fuera del correo, que va sin
        // tildes ni eñes.
        .replace(/[̀-ͯ]/g, "")
        .replace(/ñ/g, "n")
        .replace(/\s+/g, ".");
      return {
        id: `p${d.repeat(7)}-${d.repeat(4)}-${d.repeat(4)}-${d.repeat(4)}-${d.repeat(12)}`,
        name,
        documentId: `10368840${String(index + 6).padStart(2, "0")}`,
        entraObjectId: "",
        userPrincipalName: `${slug}@tuya.com`,
        position,
        // El rol y el líder técnico se resuelven por nombre más abajo, igual
        // que los stacks y el chapter: acá arrancan en su valor neutro.
        role: "Contributor" as PersonRole,
        technicalLeadId: null,
        technicalLeadName: null,
        technicalLeadOfCount: 0,
        seniority,
        seniorityLabel,
        modality,
        availableFte: 1,
        // Fija y variada a propósito: cubre 0, medios, 100 y >100 para que la
        // barra del listado muestre todos sus umbrales. No deriva de los mocks
        // de Capacidades — el backend real la calculará desde las asignaciones.
        utilization,
        monthlyCost: 6000000 + index * 350000,
        startDate: `202${(index % 4) + 1}-0${(index % 9) + 1}-15`,
        chapterId: null,
        // Camila es externa (QVision): el detalle de persona necesita una
        // externa sin célula para su segundo estado. Andrés (TATA) y Paula
        // (GFT) son externos para que la facturación tenga tres proveedores
        // con gente.
        providerId: EXTERNAL_PROVIDERS[name] ?? null,
        createdAtUtc: now,
        updatedAtUtc: now,
        stacks: seedStacks(name),
      } satisfies PersonDto;
    }
  ),
];

// Las tres personas escritas a mano también reciben sus stacks por nombre.
for (const p of initialPeople)
  if (p.stacks.length === 0) p.stacks = seedStacks(p.name);

// El chapter de cada persona, y el `oid` de los tres que lideran uno. Ambos se
// resuelven por nombre contra chapters.ts, que es el dueño de la relación:
// acá no se decide quién va a dónde, sólo se aplica.
for (const p of initialPeople) {
  p.chapterId = CHAPTER_BY_PERSON_NAME[p.name] ?? null;
  p.entraObjectId = leadEntraObjectIdOf(p.name);
}

// El rol de cada persona y quién la acompaña técnicamente, también por nombre.
// El líder técnico se resuelve a id después de que todos tienen el suyo.
const idByName = new Map(initialPeople.map((p) => [p.name, p.id]));
for (const p of initialPeople) {
  p.role = ROLE_BY_NAME[p.name] ?? "Contributor";
  const lead = TECHNICAL_LEAD_BY_NAME[p.name];
  p.technicalLeadId = (lead && idByName.get(lead)) ?? null;
  p.technicalLeadName = lead ?? null;
}

let people: PersonDto[] = initialPeople.map((p) => ({ ...p }));
let companies: CompanyDto[] = initialCompanies.map((c) => ({ ...c }));

/**
 * Lectura del estado vigente para otros handlers (hoy sólo squads.handlers, que
 * suma el FTE disponible del chapter para su resumen). Función y no array por
 * la misma razón que en allocations.handlers: `people` se reasigna en cada
 * mutación. Sólo lectura.
 */
export function getPeopleSnapshot(): PersonDto[] {
  return people;
}

/**
 * Las personas que alcanza a ver quien pidió, según el chapter que lidera —
 * ver chapters.ts. Es la lectura que tienen que usar los handlers que sirven
 * personas o cifras derivadas de personas; `getPeopleSnapshot` es el estado
 * del mock, no una respuesta.
 *
 * Quien cruce esta lista con asignaciones, ausencias o cualquier otra cosa
 * indexada por persona tiene que filtrar también esa otra lista: dejar una
 * asignación cuya persona ya no está visible no la esconde, la convierte en
 * una persona de 0 FTE y desbalancea todos los totales.
 */
export function peopleFor(request: Request): PersonDto[] {
  const chapterId = holderChapterId(request);
  return chapterId ? people.filter((p) => p.chapterId === chapterId) : people;
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan mutaciones. */
export function getCompaniesSnapshot(): CompanyDto[] {
  return companies.map((c) => ({ ...c }));
}

export function resetPeopleMock() {
  people = initialPeople.map((p) => ({ ...p }));
  companies = initialCompanies.map((c) => ({ ...c }));
}

function isValidCreateRequest(value: unknown): value is CreatePersonRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CreatePersonRequest>;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    v.name.length <= 200 &&
    typeof v.documentId === "string" &&
    v.documentId.length > 0 &&
    v.documentId.length <= 50 &&
    typeof v.userPrincipalName === "string" &&
    v.userPrincipalName.length > 0 &&
    v.userPrincipalName.length <= 250 &&
    typeof v.position === "string" &&
    v.position.length > 0 &&
    v.position.length <= 100 &&
    typeof v.role === "string" &&
    ROLE_VALUES.includes(v.role as PersonRole) &&
    (v.technicalLeadId === null ||
      v.technicalLeadId === undefined ||
      typeof v.technicalLeadId === "string") &&
    typeof v.seniority === "number" &&
    v.seniority >= 1 &&
    v.seniority <= 4 &&
    typeof v.modality === "string" &&
    MODALITIES.includes(v.modality as Modality) &&
    typeof v.availableFte === "number" &&
    v.availableFte >= 0 &&
    v.availableFte <= 1 &&
    typeof v.monthlyCost === "number" &&
    v.monthlyCost >= 0 &&
    typeof v.startDate === "string" &&
    v.startDate.length > 0
  );
}

/** El nombre de una persona por id, para acompañar la referencia en el DTO. */
function nameOfPerson(id: string | null | undefined): string | null {
  if (!id) return null;
  return people.find((p) => p.id === id)?.name ?? null;
}

/**
 * Completa lo que el servidor calcula y no se guarda: de cuántas personas es
 * líder técnico. Derivado y no almacenado, por lo mismo que la brecha del
 * span: guardarlo sería poder quedar desincronizado con el dato que lo
 * produce.
 */
function respond(person: PersonDto, visibles: PersonDto[]): PersonDto {
  return {
    ...person,
    technicalLeadOfCount: visibles.filter(
      (p) => p.technicalLeadId === person.id
    ).length,
  };
}

function filterPeople(
  source: PersonDto[],
  search: string | null,
  seniorities: number[],
  stacks: string[] = []
): PersonDto[] {
  let filtered = source;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.position.toLowerCase().includes(term)
    );
  }
  if (seniorities.length > 0) {
    filtered = filtered.filter((p) => seniorities.includes(p.seniority));
  }
  if (stacks.length > 0) {
    filtered = filtered.filter((p) =>
      p.stacks.some((s) => stacks.includes(s.name))
    );
  }
  return filtered;
}

const STATS_SAMPLE_SIZE = 5;

function computeStats(source: PersonDto[]): PeopleStats {
  return {
    activeCount: source.length,
    fteAvailable: source.reduce((sum, p) => sum + p.availableFte, 0),
    fteTarget: ASSUMED_FTE_TARGET,
    bySeniority: SENIORITIES.map(({ value, label }) => ({
      seniority: value,
      label,
      count: source.filter((p) => p.seniority === value).length,
    })),
    sample: [...source]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, STATS_SAMPLE_SIZE)
      .map((p) => ({ id: p.id, name: p.name })),
    stackCoverage: computeStackCoverage(source),
  };
}

/** Cuántos stacks distintos hay y cuáles tiene una sola persona (bus factor 1). */
export function computeStackCoverage(
  source: PersonDto[]
): PeopleStats["stackCoverage"] {
  const count = new Map<string, number>();
  for (const p of source)
    for (const s of p.stacks) count.set(s.name, (count.get(s.name) ?? 0) + 1);
  return {
    distinct: count.size,
    atRisk: [...count.entries()]
      .filter(([, n]) => n === 1)
      .map(([name]) => name)
      .sort(),
  };
}

function validStacks(body: unknown): body is { stacks: PersonStackDto[] } {
  if (typeof body !== "object" || body === null) return false;
  const stacks = (body as { stacks?: unknown }).stacks;
  if (!Array.isArray(stacks)) return false;
  const names = new Set<string>();
  let primaries = 0;
  for (const s of stacks as PersonStackDto[]) {
    if (typeof s?.name !== "string" || !STACK_CATALOG.includes(s.name))
      return false;
    if (names.has(s.name)) return false;
    names.add(s.name);
    if (typeof s.level !== "number" || s.level < 1 || s.level > 4) return false;
    if (s.isPrimary) primaries += 1;
  }
  if (primaries > 1) return false;
  if (stacks.length > 0 && primaries === 0) return false;
  return true;
}

export const peopleHandlers = [
  http.get(PEOPLE_STATS_URL, ({ request }) => {
    return HttpResponse.json(computeStats(peopleFor(request)));
  }),

  http.get(STACKS_URL, () => HttpResponse.json(STACK_CATALOG)),

  http.get(ROLES_URL, () => HttpResponse.json(ROLE_CATALOG)),

  // Sólo los que tienen el rol: es lo que el selector de líder técnico ofrece,
  // y resolverlo acá evita que cada pantalla vuelva a decidir qué es un líder
  // técnico. Acotado como todo lo demás — un lead no acompaña con gente que no
  // tiene a cargo.
  http.get(TECHNICAL_LEADS_URL, ({ request }) => {
    const leads: TechnicalLeadOption[] = peopleFor(request)
      .filter((p) => p.role === "TechnicalLead")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ id: p.id, name: p.name }));
    return HttpResponse.json(leads);
  }),

  http.put(PERSON_STACKS_URL, async ({ params, request }) => {
    const person = people.find((p) => p.id === params.id);
    if (!person) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }
    const body = await request.json().catch(() => null);
    if (!validStacks(body)) {
      return HttpResponse.json(
        {
          message:
            "Stacks inválidos: deben estar en el catálogo, sin repetir, con un único principal",
        },
        { status: 400 }
      );
    }
    // El principal primero, como lo muestra el listado.
    person.stacks = [...body.stacks].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary)
    );
    person.updatedAtUtc = new Date().toISOString();
    return HttpResponse.json(person);
  }),

  http.get(PEOPLE_URL, ({ request }) => {
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    const search = url.searchParams.get("search");
    const seniorities = url.searchParams
      .getAll("seniority")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const stacks = url.searchParams.getAll("stack");
    const visibles = peopleFor(request);
    const filtered = filterPeople(visibles, search, seniorities, stacks);
    const pagina = paginate(filtered, page, pageSize);
    return HttpResponse.json({
      ...pagina,
      items: pagina.items.map((p) => respond(p, visibles)),
    });
  }),

  http.post(PEOPLE_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de persona inválidos" },
        { status: 400 }
      );
    }
    const nowIso = new Date().toISOString();
    const created: PersonDto = {
      id: crypto.randomUUID(),
      name: body.name,
      documentId: body.documentId,
      entraObjectId: body.entraObjectId ?? "",
      userPrincipalName: body.userPrincipalName,
      position: body.position,
      role: body.role,
      technicalLeadId: body.technicalLeadId ?? null,
      technicalLeadName: nameOfPerson(body.technicalLeadId),
      technicalLeadOfCount: 0,
      seniority: body.seniority,
      seniorityLabel: SENIORITY_LABELS[body.seniority] ?? "",
      modality: body.modality,
      availableFte: body.availableFte,
      // Recién creada: sin asignaciones todavía. El campo es calculado y no
      // viene en el request.
      utilization: 0,
      stacks: [],
      monthlyCost: body.monthlyCost,
      startDate: body.startDate,
      // Nace en el chapter de quien la dio de alta. Sin esto, un lead crearía
      // personas que su propio listado no muestra.
      chapterId: holderChapterId(request),
      providerId: null,
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };
    people = [...people, created];
    return HttpResponse.json(respond(created, peopleFor(request)), {
      status: 201,
    });
  }),

  http.put(`${PEOPLE_URL}/:id`, async ({ request, params }) => {
    const { id } = params;
    const existing = people.find((p) => p.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de persona inválidos" },
        { status: 400 }
      );
    }
    const updated: PersonDto = {
      ...existing,
      name: body.name,
      documentId: body.documentId,
      // `||` y no `??`: el formulario no edita este campo y manda cadena
      // vacía, que con `??` pisaba el `oid` que ya estaba. En un lead eso es
      // grave y silencioso — deja de ser reconocible como titular del token y
      // sus pantallas pasan a mostrarle el sistema entero sin que nada falle.
      entraObjectId: body.entraObjectId || existing.entraObjectId,
      userPrincipalName: body.userPrincipalName,
      position: body.position,
      role: body.role,
      technicalLeadId: body.technicalLeadId ?? null,
      technicalLeadName: nameOfPerson(body.technicalLeadId),
      technicalLeadOfCount: 0,
      seniority: body.seniority,
      seniorityLabel: SENIORITY_LABELS[body.seniority] ?? "",
      modality: body.modality,
      availableFte: body.availableFte,
      monthlyCost: body.monthlyCost,
      startDate: body.startDate,
      updatedAtUtc: new Date().toISOString(),
    };
    people = people.map((p) => (p.id === id ? updated : p));
    // Quien deja de ser líder técnico deja de figurar como el de nadie. El
    // aviso antes de guardar es de la pantalla; acá lo que importa es que el
    // dato no quede apuntando a alguien que ya no lo es.
    if (updated.role !== "TechnicalLead") {
      people = people.map((p) =>
        p.technicalLeadId === updated.id
          ? { ...p, technicalLeadId: null, technicalLeadName: null }
          : p
      );
    }
    return HttpResponse.json(respond(updated, peopleFor(request)));
  }),

  http.delete(`${PEOPLE_URL}/:id`, ({ params }) => {
    const { id } = params;
    const existing = people.find((p) => p.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }
    people = people.filter((p) => p.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.put(`${PEOPLE_URL}/:id/provider/:providerId`, ({ params }) => {
    const { id, providerId } = params;
    const existing = people.find((p) => p.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }
    const company = companies.find((c) => c.id === providerId);
    if (!company) {
      return HttpResponse.json(
        { message: "Proveedor no encontrado" },
        { status: 404 }
      );
    }
    people = people.map((p) =>
      p.id === id
        ? {
            ...p,
            providerId: company.id,
            updatedAtUtc: new Date().toISOString(),
          }
        : p
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/catalogs/seniorities", () => {
    return HttpResponse.json(SENIORITIES);
  }),

  http.get("/catalogs/modalities", () => {
    return HttpResponse.json(MODALITIES);
  }),

  http.get("/companies", () => {
    return HttpResponse.json(companies);
  }),
];
