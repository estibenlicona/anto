## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Patrones ya asentados**: feature por carpeta (`services` → `adapters` → `hooks` → `components` → `Container`), página delgada que monta el container, mock en `mocks/handlers/*.handlers.ts` + `*.seeds.ts` con `reset*()`, tests con el mock real, breadcrumb por `navigation.ts` + `useLeadBreadcrumbTrailing`.
- **Identidades DevOps** viven en `personDetail.handlers.ts` (`identities` en memoria, vinculación por `POST`). El backlog necesita leerlas para resolver usuario DevOps → persona. Hoy no hay snapshot exportado.
- **`SidebarNavItem.badge`** ya existe en `AppShell`/`Sidebar` (con nombre accesible "N pendientes"); el layout arma `groups` desde `leadNavGroups` y no tiene de dónde sacar el número.
- **tuip** trae `OptionCard`/`OptionCardGroup`, `Textarea`, `Kbd`, `Chip selectable`, `SegmentedControl`, `Select`, `Drawer`, `Progress`, `EmptyState`; la app reinstala el `.tgz`.
- Diseño de referencia: canvas "Backlog y Curación" (cola + historia en curso; drawer de rechazo).

## Goals / Non-Goals

**Goals:**
- Una pantalla que se pueda despachar con el teclado: la cola avanza sola al guardar o saltar.
- Un solo primario en pantalla (Guardar y siguiente) y uno en el drawer (Rechazar).
- Mock coherente con el resto de mocks: persona/célula derivadas, no copiadas.

**Non-Goals:**
- Persistir el "hoy" del progreso más allá de la sesión (el mock cuenta `classifiedAt` de hoy).
- Virtualizar la cola: las seeds son decenas, no miles.
- Mapeo Epic ↔ Iniciativa y Board.

## Decisions

1. **Un endpoint de cola con resumen y filtros, y cuatro mutaciones por item.** `GET /backlog/queue?squadId&personId&status` devuelve `{ items, summary }`; el cliente no compone nada. Catálogos aparte (`GET /backlog/catalogs`) porque son estáticos y los usa el drawer y las tarjetas. Alternativa: un único `GET` con todo — descartada: los catálogos no cambian por filtro.

2. **Exportar `getDevOpsIdentitiesSnapshot()` desde `personDetail.handlers.ts`** (`{ personId, userName }[]`), lectura en un solo sentido como `getPeopleSnapshot`. El backlog resuelve `assignedTo` (usuario DevOps) → persona por esa tabla; sin match → excluida. Las seeds del backlog referencian usuarios DevOps (`clopez@tuya`, `dsalazar@tuya`…), no personas, para que vincular una identidad haga aparecer sus historias sin tocar las seeds.

3. **Iniciativas activas viven en `backlog.seeds.ts`** (`{ id, name, squadId }`), no en un mock de iniciativas: no hay feature de iniciativas en el frontend y crearla excede el change. Cuando exista, el catálogo del backlog la leerá de ahí (anotado en el proposal como fuera de alcance).

4. **La cola es estado del servidor, no del cliente.** El orden (`order` numérico en el mock) cambia con saltar; el cliente siempre muestra la cola que recibe y pone en curso la primera pendiente del filtro. Tras cada mutación, `refetch` y en curso = primera. Alternativa: manejar el cursor en el cliente — descartada: con deshacer y rechazar-con-reasignación la cola cambia de forma, y el servidor es la única verdad.

5. **Atajos con un `useEffect` de `keydown` en el container**, ignorados cuando `event.target` es `input`/`textarea`/`select`/`[contenteditable]` o hay un drawer abierto. `1/2/3` cambian el valor del `OptionCardGroup`, `Enter` dispara guardar, `S` saltar. Se documentan con `Kbd` en el pie.

6. **Estado del formulario de decisión**: `{ kind, initiativeId, bauCategory }` con `useState` reiniciado por `key={item.id}`; la sugerencia (`item.suggestedInitiativeId`) inicializa `kind="initiative"` + `initiativeId`; sin sugerencia, `kind` vacío. Validación en `backlogValidation.ts` (pura, testeable): iniciativa exige `initiativeId`, BAU exige `bauCategory`, descartar no exige nada.

7. **Badge de Backlog**: hook `useBacklogPendingCount()` (llama al resumen de la cola sin filtros) consumido en `ChapterLeadLayout`, que pasa `badge` al item `lead-backlog` al mapear `leadNavGroups`. Se refresca al montar y al volver a la pestaña (`visibilitychange`); el container de Backlog además lo invalida tras cada mutación vía un pequeño `EventTarget` compartido (`backlogEvents`), sin introducir estado global nuevo. Alternativa: contexto/provider — más plumbing para un número.

8. **Drawer de rechazo** (`RejectItemDrawer`): `SegmentedControl` no cabe con cinco motivos largos → `RadioGroup` en fila de chips no existe; se usa `Chip selectable` en modo excluyente manejado por el drawer (uno encendido a la vez). "¿De quién es?" con `Select` de personas del chapter (del `getPeopleSnapshot` vía `capacityOverview.people`), detalle con `Textarea`.

9. **Componentes**: `features/backlog/components/{BacklogHeader, BacklogQueue (con QueueRow), BacklogQueueFilters, CurrentStoryPanel (zonas qué es / de quién es), DecisionCards (OptionCardGroup), StoryFooter (Kbd + acciones), RejectItemDrawer, ClassifiedList (vista Clasificadas con deshacer)}`. Tests unitarios por componente con fixtures; container con el mock real.

10. **Enlace del detalle de persona**: `Link asChild` a `/app/lead/backlog?persona=${id}`; el container lee `useSearchParams` y precarga el filtro por persona (chip "Persona: Nombre ×" removible para salir del filtro).

## Risks / Trade-offs

- [Atajos globales pueden disparar sobre un Select abierto] → se ignoran con foco en controles y con drawer abierto; test del guard.
- [Seeds de DevOps son ficción] → un solo archivo `backlog.seeds.ts`, comentado; los tests verifican reglas, no cifras.
- [El badge depende de una llamada extra en el layout] → es el mismo endpoint de la cola, cacheado por el hook; si falla, sin badge (nunca bloquea el shell).
- [Dos fuentes de "persona sin identidad"] → el detalle de persona y el backlog leen la misma tabla en memoria (`getDevOpsIdentitiesSnapshot`), así que vincular en uno se ve en el otro.

## Migration Plan

1. Reinstalar `@tuya-ui/components`. 2. Mock + seeds + tests. 3. Servicio/adapter/hooks. 4. Componentes. 5. Container, página, ruta, nav + badge, enlace del detalle. 6. Verificación (suite, typecheck, lint, navegador).
