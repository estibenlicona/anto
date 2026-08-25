## Context

Células es hoy el módulo más básico del shell de Chapter Lead: `SquadsContainer` renderiza directo `SquadsList` (botón suelto + tabla de 4 columnas) sin encabezado ni resumen, `useSquads` sólo pagina, y el `SquadDto` trae únicamente los atributos del formulario. Personas, en cambio, ya encarna el patrón objetivo —`PeopleHeader` + `PeopleStatsCards` + `PeopleList` con toolbar de búsqueda/filtro, filas con jerarquía (nombre + correo), avatares con color de identidad, columnas derivadas (FTE, utilización)— y `GET /people/stats` sirve sus cards. Ver proposal.md - Why.

La información "extra" que el dominio ya maneja para una célula está en las **asignaciones** (`Allocation`: persona ↔ célula con % de dedicación repartido en BAU/Transformación, ya con pantalla propia en Capacidades). De ahí salen equipo y capacidad asignada. Iniciativa activa y tablero DevOps, que el mockup v7 (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`, `renderCellTable`) también muestra por célula, no tienen módulo en el frontend y se excluyen (ver proposal - Fuera de alcance).

Restricciones que condicionan el diseño:

- **Mock-only, como `GET /people/stats`**: el backend .NET real no se toca. Los mocks de MSW viven por archivo y hasta hoy no cruzan estado (`allocations.handlers.ts` replica nombres "a mano" en vez de leer `people.handlers.ts`). Este change sí necesita cruzar: el listado y las stats de células se calculan sobre las asignaciones y personas en memoria.
- **`tuip` ya tiene todo**: `Card`, `Progress` (`brandFill`), `SegmentedBar` (roles de estado / color categórico / tonos de acento, `separated`), `AvatarGroup`/`Avatar` (`colorId`), `SearchField`, `FilterButton`, `Badge`, `Menu`, `EmptyState`. No se propone ningún change en tuip.
- `useSquads(initialPageSize)` lo reutiliza `AllocationsContainer` para el selector de célula: la firma debe seguir sirviendo para ese consumidor.
- `SegmentedBar` no tiene rol `neutral` (sólo `info|warning|success|danger`); `Badge` sí tiene `neutral`. Ver decisión sobre el color de "Baja".

## Goals / Non-Goals

**Goals:**
- Llevar Células al mismo patrón de presentación que Personas (encabezado, 3 cards, toolbar, filas con jerarquía e información derivada), reutilizando estructura y componentes ya probados en ese módulo.
- Que equipo y capacidad por célula salgan de datos reales del mock (asignaciones en memoria), no de números fijos, para que la pantalla sea coherente con Capacidades en la misma sesión.
- Dejar el contrato de datos listo para que el backend real lo implemente después sin cambiar la UI.

**Non-Goals:**
- Pantalla de detalle de célula, iniciativa activa, tablero DevOps, migración del formulario a `Drawer`, backend real, cambios en `tuip` (ver proposal).
- Ordenamiento por columnas.
- Compartir código entre `PeopleStatsCards` y `SquadsStatsCards` mediante una abstracción genérica: son tres cards cada una con lecturas distintas; se copia la estructura, no se generaliza todavía.

## Decisions

### D1. Contrato: campos calculados en `SquadDto` + `GET /squads/stats`

```ts
// squadService.ts
export interface SquadMemberSampleDto { id: string; name: string }

export interface SquadDto {
  // ...campos actuales sin cambios...
  /** Calculados por el backend desde las asignaciones vigentes; sólo lectura. */
  memberCount: number;
  members: SquadMemberSampleDto[];     // hasta 3, para los avatares
  allocatedFte: number;                // Σ dedicationPercentage / 100
  bauFte: number;                      // Σ bauPercentage / 100
  transformationFte: number;           // Σ transformationPercentage / 100
}

export interface SquadsStats {
  totalCount: number;
  withoutTeamCount: number;
  tribeCount: number;
  allocatedFte: number;
  bauFte: number;
  transformationFte: number;
  chapterFte: number;                  // Σ availableFte de las personas
  byCriticality: { criticality: Criticality; count: number }[]; // siempre los 4
}
```

- **Por qué campos en el DTO y no un segundo endpoint por fila**: es el mismo criterio de `PersonDto.utilization` (`add-capacity-columns-to-people-list`): la fila necesita el dato al renderizar, y un backend real lo resuelve con un join. Un `GET /squads/:id/summary` por fila multiplicaría llamadas.
- **Por qué un `GET /squads/stats` aparte** y no derivarlo del listado: el resumen es sobre el total, y el listado está paginado y filtrado. Mismo criterio que `GET /people/stats`.
- **`members` sólo trae 3**: la fila muestra hasta 3 avatares y "+N" con `memberCount`; mandar todo el equipo por fila sería peso inútil. Se eligen por nombre ascendente para que sean estables entre recargas.
- **`byCriticality` sin `label`**: la etiqueta en español es decisión de la UI (ver D4); el catálogo real devuelve `string[]` de códigos y no queremos exigirle al backend un contrato de etiquetas que hoy no tiene.
- **`chapterFte` como denominador** en lugar del `fteTarget` fijo del mock de personas: la pregunta de la card es "cuánto de la capacidad que tengo está puesta en células", y la capacidad que tengo es la suma del FTE disponible de las personas — dato real en ambos mocks. Cuando exista una capacidad objetivo real, el backend decide qué devolver.
- `Create/UpdateSquadRequest` no cambian: los campos nuevos son calculados y el guard del mock los ignora si llegan.

### D2. Mock: el handler de células cruza estado con asignaciones y personas

`allocations.handlers.ts` y `people.handlers.ts` exportan un accesor de sólo lectura a su estado en memoria (`getAllocationsSnapshot(): AllocationDto[]`, `getPeopleSnapshot(): PersonDto[]`), y `squads.handlers.ts` los importa para enriquecer cada `SquadDto` al responder `GET /squads` y calcular `GET /squads/stats`.

- **Por qué accesores y no importar el array**: los handlers reasignan su array en cada mutación (`squads = [...]`), así que un import del binding no es confiable como valor; una función devuelve siempre el estado vigente.
- **Dirección de la dependencia**: sólo `squads → allocations, people`. Ninguno de los otros dos importa `squads`, así que no hay ciclo. Se documenta en el handler como la única excepción al "no cruzar mocks" vigente.
- **Semillas**: hoy hay 2 células y 1 asignación. Se suben a ~5 células (cubriendo las 4 criticidades, al menos 2 tribus, una sin equipo) y las asignaciones necesarias para que las columnas y cards tengan variedad (una célula con >3 personas para ver el "+N"). Los ids/nombres de personas se toman de las semillas reales de `people.handlers.ts`. Los `resetXMock()` existentes siguen cubriendo los tests.
- **Alternativa descartada**: valores fijos por célula como se hizo con `utilization` en Personas. Ahí se aceptó porque era un número; acá son 5 campos correlacionados entre sí y con la pantalla de Capacidades, y los números fijos se desfasarían en cuanto alguien asigne a alguien en modo navegador.

### D3. Enriquecimiento en el cliente: `SquadAdapter`

`Squad` (entidad UI) suma `criticalityLabel`, `memberCount`, `members`, `allocatedFte`, `bauFte`, `transformationFte`. El formato numérico (`toFixed(1)`) se hace en el componente, no en el adapter, como en `PeopleStatsCards`.

### D4. Etiquetas de criticidad en la UI

Un mapa único `CRITICALITY_LABELS: Record<Criticality, string>` (`Critical → Crítica`, `High → Alta`, `Medium → Media`, `Low → Baja`) vive en `SquadAdapter.ts` y lo consumen el badge de la fila, las opciones de `FilterButton`, el `Select` de `SquadFormModal` y la leyenda de la card. El valor enviado al backend sigue siendo el código. Orden fijo `Critical, High, Medium, Low` para filtro, formulario y leyenda (es una escala, no categorías sueltas).

### D5. Colores de criticidad: roles de estado, con "Baja" en gris categórico

| Criticidad | `Badge.variant` (fila) | Segmento / punto de leyenda (card) |
|---|---|---|
| Crítica | `danger` | `role: "danger"` · `bg-danger-bold` |
| Alta | `warning` | `role: "warning"` · `bg-warning-bold` |
| Media | `info` | `role: "info"` · `bg-info-bold` |
| Baja | `neutral` | `color: "gray"` · punto con la misma clase que usa el segmento gris |

`SegmentedBar` no tiene rol `neutral`; el gris categórico es el mismo matiz neutro que `Badge` pinta para `neutral`, así que el spec "mismo color en card y fila" se cumple visualmente. La card usa `separated` (son categorías, no partes de un continuo, igual que la distribución por seniority). Si `tuip` agrega `role: "neutral"` a `SegmentedBar`, se cambia una línea.

- **Alternativa descartada**: tonos de acento (`slate/blue/teal/purple`) como en seniority. Seniority es una escala ordinal sin connotación de estado; la criticidad sí es un estado (una célula crítica *alerta*), y el badge ya la pinta con roles semánticos. Cambiarla a acentos partiría el código de color de la pantalla.

### D6. Estructura de componentes, espejo de Personas

```
SquadsContainer
├── SquadsHeader          (título, descripción, "Nueva célula")       ← PeopleHeader
├── SquadsStatsCards      (3 cards; null mientras carga o si falla)   ← PeopleStatsCards
└── SquadsList            (toolbar + tabla + paginación)              ← PeopleList
```

- `SquadsStatsCards` devuelve `null` en carga/error, igual que `PeopleStatsCards`: el spec pide que el resumen nunca bloquee el listado.
- **Card 1 "Células"**: métrica `totalCount`, icono `cell`; pie: "N sin equipo · M tribus".
- **Card 2 "Capacidad asignada"**: métrica `allocatedFte.toFixed(1)` con `/ chapterFte.toFixed(1)` al lado; `Progress brandFill value={pct}` con `pct = chapterFte > 0 ? allocatedFte / chapterFte * 100 : 0`; pie: "X% de la capacidad del chapter" y "BAU a.a · Transformación b.b". El desglose BAU/Transformación va como texto, no como segunda barra: dos barras en una card de 3 columnas compiten entre sí.
- **Card 3 "Distribución por criticidad"**: `SegmentedBar separated` + leyenda a 2 columnas con punto/etiqueta/conteo, total de células en el slot derecho del header; sin pie de lecturas derivadas (a diferencia de seniority, no hay una lectura obvia que sumar — "N críticas o altas" sería redundante con la leyenda de 4 líneas).
- `SquadsContainer` refetchea listado **y** stats tras cada mutación exitosa, como `PeopleContainer`.
- `LeadSquadsPage` deja de imprimir el `h1 sr-only`: el `h1` visible pasa a ser el del encabezado (dos `h1` en la página sería peor para accesibilidad que antes). `LeadPeoplePage` hoy tiene la misma duplicación; no se corrige aquí (fuera de alcance), pero queda anotado.

### D7. Filas de `SquadsList`

| Columna | Contenido |
|---|---|
| Célula | nombre (`text-neutral-default`, peso medio) + descripción debajo en `text-label font-normal tracking-normal text-neutral-subtle truncate` con `title={description}`; la celda lleva un `max-w` para que el truncado actúe. Sin enlace (no hay detalle). Sin avatar: el avatar es identidad de persona; una célula no la tiene. |
| Tribu | texto plano |
| Criticidad | `Badge variant` por D5 + `criticalityLabel` |
| Equipo | `AvatarGroup max={3}` de `members` con `Avatar size="small" colorId={member.id}` e iniciales vía `getPersonInitials` (importado de `@features/people/adapters/PersonAdapter` — misma función, mismo color por id que Personas) + "N personas"; `memberCount === 0` → "Sin equipo" en `text-neutral-subtle`. |
| Capacidad | `allocatedFte.toFixed(1)` + " FTE" en `tabular-nums`; debajo "BAU a.a · Transf. b.b" con el mismo estilo secundario de la descripción. |
| Acciones | `Menu`: Editar · Ver equipo (`icon="team"`) · separador · Eliminar (destructive) |

- "Ver equipo" usa `useNavigate()` hacia `/app/lead/capacidades?celula=<id>` desde `SquadsContainer` (la lista recibe `onViewTeam(squad)`, como recibe `onEdit`). `SquadsContainer.test.tsx` ya envuelve en router (usa `render` de la misma forma que Personas); si no, se agrega `MemoryRouter`.
- Toolbar: `SearchField` "Buscar por nombre o tribu" + `FilterButton label="Criticidad"` con opciones de D4. `useSquads` gana `search`, `criticalities`, `onSearchChange`, `onCriticalitiesChange` con reset a página 1, manteniendo `initialPageSize` como primer parámetro para no romper `AllocationsContainer`. Serialización de `criticality` repetido (`criticality=A&criticality=B`), como hace `personService` con `seniority`.
- Estado vacío: sin filtros activos → el `EmptyState` actual ("Todavía no hay células", botón "Nueva célula"); con filtros → `EmptyState` de "Sin resultados" con icono `search`, conservando el toolbar visible.

### D8. Preselección de célula en Capacidades por URL

`AllocationsContainer` reemplaza `useState<string|undefined>` por `useSearchParams()`: lee `celula`, y al cambiar el `Select` escribe el parámetro (`replace: true` para no ensuciar el historial). Si el id no está entre las células cargadas, se trata como "sin selección" (el `Select` no tiene valor y no se llama a `useAllocations` con un id inválido). Mientras `useSquads` carga, el id de la URL se conserva; sólo se valida cuando llega la lista.

- **Alternativa descartada**: pasar la célula por `location.state`. No sobrevive a un refresh ni es compartible; el query param sí.

### D9. Pruebas

- `squads.handlers` (nuevo test junto a `peopleStats.handler.test.ts`): filtros, campos calculados tras crear/quitar asignación, stats con 0 personas.
- `SquadAdapter`: etiqueta de criticidad y propagación de campos calculados.
- `useSquads`: reset a página 1 al buscar/filtrar; firma compatible con `initialPageSize`.
- `SquadsList`: columnas nuevas, "Sin equipo", "+N" con más de 3 miembros, truncado de descripción (`title`), estados vacíos diferenciados, "Ver equipo" dispara `onViewTeam`.
- `SquadsStatsCards`: `null` en carga/error, cálculo de % con `chapterFte = 0`, leyenda con los 4 niveles incluso en cero.
- `SquadsContainer`: encabezado, refetch de stats tras mutación, navegación de "Ver equipo".
- `AllocationsContainer`: preselección por `?celula=`, id desconocido, cambio de célula actualiza la URL.

## Risks / Trade-offs

- [Los mocks de células ahora dependen del estado de otros dos mocks] → Dependencia en una sola dirección, vía accesores de sólo lectura, documentada en el handler; los tests que ejercitan células llaman también `resetAllocationsMock()`/`resetPeopleMock()` cuando dependen de los cálculos.
- [El backend real no devuelve los campos calculados ni `GET /squads/stats` ni acepta `search`/`criticality`] → Brecha documentada, mismo estado que `GET /people/stats` y `utilization`. Con el backend real, la UI mostraría `undefined` en equipo/capacidad: el adapter los normaliza a 0 / `[]` para que la tabla no rompa mientras tanto.
- ["Baja" usa gris categórico y no un rol de estado en la barra] → Visualmente idéntico al `Badge neutral`; documentado en D5 con la línea a cambiar si tuip agrega el rol.
- [Importar `getPersonInitials` desde `features/people` acopla squads con people] → Es una función pura de presentación y garantiza exactamente las mismas iniciales; moverla a `shared/` es un refactor trivial si aparece un tercer consumidor.
- [`chapterFte` como denominador puede dar >100% si las personas están sobreasignadas] → `Progress` ya satura y cambia a `danger` por encima de 100, que es justo la señal correcta (capacidad comprometida por encima de la disponible).
