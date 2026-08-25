## Context

El listado de Células ya muestra equipo y capacidad por fila (change `redesign-squads-module`), pero la gestión del equipo vive en `AllocationsContainer` (`/app/lead/capacidades`), que elige la célula con un `Select` y acepta `?celula=`. El mockup aprobado (artifact "Detalle de Célula", artboards `Main.dc.html` y `ListadoEnlace.dc.html` en el scratchpad de esta sesión) mueve esa gestión a una página de detalle por célula. Ver proposal.md - Why.

Estado que condiciona el diseño:

- `useAllocations(squadId)`, `useAllocationMutations`, `AllocationFormModal`, `RemoveAllocationConfirmDialog` y `AllocationsList` ya funcionan para una célula dada; el contenedor es lo único atado al selector y a la URL.
- El mock de células no implementa `GET /squads/:id` aunque el spec lo declara. `GET /squads/stats` ya existe y va registrado antes de las rutas con `:id`.
- `allocations.handlers.ts` hoy no cruza con `people.handlers.ts` (replica nombres a mano). La fila del mockup necesita cargo, modalidad, seniority y disponibilidad de la persona: hay que cruzar, como ya hace `squads.handlers.ts` (accesores de sólo lectura, dependencia en un solo sentido).
- El shell: `resolveLeadNavId` compara la ruta exacta, así que `/app/lead/celulas/:id` dejaría la navegación sin entrada activa; `ChapterLeadLayout` arma un breadcrumb fijo de dos niveles (`Plataforma / <título>`).
- `PeopleList` ya tiene el patrón de nombre como enlace neutro (`Link asChild tone="neutral"` + `RouterLink`) y `SeniorityCard density="compact"`; el detalle y la fila del equipo los reutilizan.
- Componentes de `tuip` necesarios ya existen: `Tabs`, `Card`, `Progress`, `SegmentedBar`, `AvatarGroup`, `Badge`, `SeniorityCard`, `SearchField`, `FilterButton`, `EmptyState`, `Menu`, `Breadcrumb`, `Link`.

## Goals / Non-Goals

**Goals:**
- Página de detalle fiel al mockup, compuesta con los componentes existentes y reutilizando la feature `allocations` sin duplicar su lógica.
- Eliminar Capacidades limpiamente (ruta, página, menú, tests) dejando redirecciones.
- Datos de la fila y del resumen del equipo calculados de verdad en el mock, coherentes con el listado de Células en la misma sesión.

**Non-Goals:**
- Tabs Iniciativas/Resumen/Backlog, detalle de persona, `Drawer` en formularios, backend real, `tuip`.
- Un "PeopleRow" compartido entre Personas y el equipo: la celda de persona se compone en `AllocationsList` con los mismos primitivos (`Avatar` + `getPersonInitials` + `SeniorityCard`); si aparece un tercer consumidor, se extrae.

## Decisions

### D1. Ruta y página

`routes.tsx`: `{ path: "celulas/:id", element: <LeadSquadDetailPage /> }` bajo `ChapterLeadLayout`; `LeadSquadDetailPage` lee `useParams().id` y monta `SquadDetailContainer squadId={id}`. `{ path: "capacidades", element: <CapacityRedirect /> }` reemplaza a `LeadCapacityPage`: un componente mínimo que lee `?celula=` y hace `<Navigate replace to=…/>` al detalle o al listado. `LeadCapacityPage` y su carpeta se eliminan.

- **Alternativa descartada**: mantener Capacidades además del detalle. El usuario eligió eliminarla; dos entradas a la misma gestión confunden y duplican tests.

### D2. Shell: entrada activa por prefijo y breadcrumb de tres niveles

- `resolveLeadNavId` pasa a elegir la entrada cuyo `href` es igual a la ruta **o un prefijo seguido de `/`** (la más larga gana, para que `/app/lead` no capture todo). Tests de `navigation` cubren `/app/lead/celulas/abc`.
- Breadcrumb: el detalle publica su nombre con un contexto mínimo `LeadBreadcrumbContext` (`{ trailing?: string; setTrailing }`) provisto por `ChapterLeadLayout`; `SquadDetailContainer` setea el nombre al cargar la célula y lo limpia al desmontar. El layout renderiza `[Plataforma, Gestionar Células (link a /app/lead/celulas), <nombre>]` cuando hay `trailing`, y los dos niveles actuales si no.
  - **Alternativa descartada**: `handle` de rutas con `useMatches`: el nombre de la célula no está en la ruta, llega asíncrono; un contexto es más simple que un loader.

### D3. Contrato de datos (mock-only)

```ts
// allocationService.ts — AllocationDto gana (sólo lectura, calculados por el backend):
personPosition: string;
personModality: Modality;
personSeniority: Seniority;          // 1..4
personSeniorityLabel: string;
personAvailablePercentage: number;   // max(0, 100 − Σ dedicación de la persona en todas sus células)
personOtherSquadsPercentage: number; // Σ dedicación de la persona en OTRAS células
// listBySquad(squadId, page, pageSize, search?, seniorities?)  — `seniority` repetido, como personService

// squadService.ts
getById(id): Promise<SquadDto>                // GET /squads/:id
getTeamStats(id): Promise<SquadTeamStats>      // GET /squads/:id/team-stats
interface SquadTeamStats {
  memberCount: number;
  members: { id: string; name: string }[];     // todos, por nombre
  expertCount: number;                         // seniority 4
  beginnerCount: number;                       // seniority 1
  allocatedFte: number; bauFte: number; transformationFte: number;
  teamAvailableFte: number;                    // Σ availableFte de las personas del equipo
}
```

- **Por qué `team-stats` aparte del `GET /squads/:id`**: el resumen depende de personas + asignaciones y se refetchea tras cada mutación del equipo; la célula no cambia por eso. Mismo criterio que `/squads/stats` vs listado.
- **Por qué los campos de persona van en `AllocationDto`** y no se cruzan en el cliente con `usePeople`: la tabla pagina y filtra en el servidor (búsqueda por cargo, filtro por seniority) — el backend real los resolverá con un join.
- `AllocationAdapter` normaliza los campos nuevos (`?? 0`, `?? ""`) para tolerar el backend real, como hizo `SquadAdapter`.

### D4. Mock

- `allocations.handlers.ts` importa `getPeopleSnapshot` de `people.handlers.ts` (sólo lectura, sin ciclo: people no importa a nadie) y enriquece cada asignación al responder (`enrich(a)`), incluyendo el `POST`/`PUT`. `PERSON_NAMES` desaparece: el nombre sale de la persona en memoria (fallback al `personName` guardado). Filtros `search`/`seniority` antes de paginar, igual que `filterPeople`.
- `squads.handlers.ts`: `GET /squads/:id` (enriquecido, 404 si no existe) y `GET /squads/:id/team-stats`, registrados **después** de `/squads/stats` y antes de `PUT/DELETE /:id` (MSW no confunde métodos, pero el orden mantiene la lectura clara). `team-stats` cruza asignaciones y personas con los accesores ya existentes.
- Semillas: las actuales ya dan a Backend Platform 4 personas con 2 Expertos (Carlos, Paula) y un caso de persona al tope (Paula tiene 40% aquí y 60%… hoy 0% en otras); se ajusta una semilla para que exista el caso "0% libre · N% en otras células" (p. ej. Paula 40% en Backend + 60% en Plataforma de Datos).

### D5. Composición del detalle

```
LeadSquadDetailPage (useParams)
└── SquadDetailContainer (squadId)
    ├── useSquad(squadId) · useSquadTeamStats(squadId) · useSquadMutations · useCriticalities
    ├── SquadDetailHeader   (← Células, h1, Badge, tribu, descripción; Editar / Asignar persona / menú Eliminar)
    ├── SquadTeamStatsCards (3 cards; null en carga/error)
    ├── Tabs (una sola TabsTrigger "Equipo" con count)
    └── AllocationsContainer squadId={squadId} onChanged={refetchTeamStats} ref/handle para openCreate
    ├── SquadFormModal (editar) · DeleteSquadConfirmDialog (→ navigate al listado al confirmar)
```

- **`AllocationsContainer` recibe `squadId` por prop** y pierde el `Select`, `useSearchParams` y `useSquads`. Expone `onChanged` (llamado tras crear/editar/quitar con éxito) para que el detalle refetchee `team-stats` y `useSquad` (los campos calculados de la célula cambian). Para que "Asignar persona" del encabezado abra el formulario del contenedor hijo, el contenedor acepta `createRequestKey: number` — el detalle lo incrementa y el hijo abre el modal en un efecto (evita `forwardRef`/imperative handle).
- **Estados**: `useSquad` con `notFound` (404) separado de `error`; el contenedor renderiza `EmptyState` "Célula no encontrada" con enlace al listado, o `Alert` + Reintentar.
- **Cards** (valores del mockup, `SquadTeamStats`):
  - Equipo: `memberCount`; `AvatarGroup max={4}` con `members`; pie "N expertos · M requiere(n) acompañamiento".
  - Capacidad asignada: `allocatedFte.toFixed(1)` / `teamAvailableFte.toFixed(1)` FTE; `Progress brandFill value={pct}` con `pct = teamAvailableFte > 0 ? allocatedFte/teamAvailableFte*100 : 0`; pie "X% del FTE disponible del equipo" y "Y libre" (`max(team − allocated, 0)`).
  - Mix: `SegmentedBar` (no `separated`: son partes de un todo) con BAU `tone: "slate"` y Transformación `tone: "blue"` (vocabulario de acento, como el mockup: no son estados); leyenda 2 columnas; pie "Z% del esfuerzo va a operación" (`bau/allocated`, 0 si allocated = 0).
- **Fila del equipo** (`AllocationsList`): celda Persona = `Avatar size="large" colorId={personId}` + nombre (texto, sin enlace) + "cargo · modalidad" en el estilo secundario de Personas; Seniority = `SeniorityCard level={personSeniorityLabel} density="compact"`; Dedicación = barra 96px con umbrales de `PeopleList` (1–99 success, 100 warning) + %; BAU/Transf = `SegmentedBar` compacto con tonos slate/blue + "BAU a% · Transf. b%"; Disponible = `"N% libre"` en success si N>0, `"0% libre · M% en otras células"` en warning si N=0 y M>0, `"0% libre"` neutro si no.
- Toolbar del equipo: `SearchField` "Buscar por nombre o cargo" + `FilterButton` "Seniority" con el catálogo de `useCatalogs` (people). `useAllocations` gana `search`/`seniorities` con reset a página 1 (patrón de `useSquads`).

### D6. Listado

`SquadsList`: el nombre pasa a `<Link asChild tone="neutral"><RouterLink to={`/app/lead/celulas/${id}`}>` (copiado de `PeopleList`, con sus mismos comentarios de por qué neutro); se quita el `MenuItem` "Ver equipo" y la prop `onViewTeam`; `SquadsContainer` pierde `viewTeam`/`useNavigate`. El test de `SquadsContainer` que cubría "Ver equipo" pasa a cubrir el enlace.

### D7. Pruebas

- `navigation.test`: `resolveLeadNavId` por prefijo; menú sin Capacidades. `ChapterLeadLayout.test`: breadcrumb de tres niveles cuando hay `trailing`.
- Handlers: `GET /squads/:id` (200/404), `team-stats` (conteos, FTE, 404, célula sin equipo), asignaciones con campos de persona y disponibilidad (caso 40/60), filtros.
- `useSquad`, `useSquadTeamStats`, `useAllocations` (search/seniority).
- `SquadDetailHeader`, `SquadTeamStatsCards` (null, división por cero, lecturas), `AllocationsList` (columnas, umbrales, disponibilidad, estados vacíos), `AllocationsContainer` (sin selector, `createRequestKey`), `SquadDetailContainer` (carga real del mock: encabezado, cards, tabla, not-found, enlace de vuelta), `SquadsList`/`SquadsContainer` (enlace, sin "Ver equipo"), `CapacityRedirect`.
- Eliminar `LeadCapacityPage` y ajustar cualquier test de rutas que la referencie.

## Risks / Trade-offs

- [Dos contenedores anidados (`SquadDetailContainer` → `AllocationsContainer`) con refetch cruzado] → Contrato explícito y pequeño (`squadId`, `onChanged`, `createRequestKey`); evita mover toda la lógica de asignaciones al detalle.
- [`allocations.handlers` pasa a depender de `people.handlers`] → Sólo lectura, un sentido, documentado como la segunda excepción al "cada mock vive solo" (la primera es squads).
- [El backend real no devuelve nada de esto] → Brecha documentada; adapters normalizan para que la UI no rompa.
- [Eliminar Capacidades rompe enlaces guardados] → Redirección con `replace` desde `/app/lead/capacidades(?celula=)`.
- [El breadcrumb por contexto puede quedar "pegado" si el detalle no limpia] → Limpieza en el cleanup del efecto, cubierta por test.
