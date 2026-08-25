## Context

Ver proposal.md - Why. Estado actual que condiciona el enfoque:

- El listado de Personas ya enlaza a `/app/lead/personas/:id` (`PeopleList.tsx`); la ruta no está en `routes.tsx`. El detalle de célula (`LeadSquadDetailPage` → `SquadDetailContainer`) es el patrón a copiar: página delgada que lee `:id` y monta un container de feature; breadcrumb publicado con `LeadBreadcrumbContext` (`useLeadBreadcrumb(label)`); entrada activa por prefijo de ruta (`navigation.ts`).
- La Torre de control (`add-control-tower-reassignment`, terminado, sin archivar) aporta `ReassignPersonDrawer` (props `person: OverviewPerson`, `squads: OverviewSquad[]`, `onSubmit(plan)`), `reassignValidation.ts` y la semántica mover = quitar + crear en `ControlTowerContainer.handleSubmit`. El drawer arranca en `move` o `assign` según `person.allocation`; no acepta todavía modo ni destino iniciales.
- Mocks: `people.handlers`, `allocations.handlers` (`getAllocationsSnapshot`), `squads.handlers` (`getSquadsSnapshot`), `chapter.handlers` (`computeCapacityOverview`, que ya cruza los tres). Nada de horas, sprints por persona, DevOps ni capacidades.
- Diseño de referencia: canvas "Detalle de Persona" (artboards con célula / sin célula). Vocabulario ya adoptado de `tuip`: `CapacityBar`, `SegmentedBar`, `DistributionCard`, `SeniorityCard`, `Badge`, `Drawer`, `FormSection`, `DedicationCell` (compartido en la app).

## Goals / Non-Goals

**Goals:**
- Una sola llamada (`GET /people/:id/detail`) alimenta toda la página; el container no compone cinco hooks.
- Reutilizar el drawer y las mutaciones de la Torre sin duplicar la lógica de "mover = quitar + crear": extraerla a un hook compartido.
- Que el detalle siga a los cambios de asignación de la sesión (derivación desde los snapshots, no copias).
- Componentes por panel, testables sueltos, como en `control-tower/components`.

**Non-Goals:**
- Modelar horas / DevOps / capacidades en el backend o en `openspec/specs` más allá del mock.
- Gráficos con librería: las barras por sprint se dibujan con `SegmentedBar`/divs, como el resto de la app.
- Edición de capacidades y bandeja de curación (enlaces a placeholder).

## Decisions

1. **Un endpoint agregado de detalle, no composición en el cliente.** `GET /people/:id/detail` devuelve `PersonDetailDto` con persona + asignación + horas + DevOps + capacidades + ficha + sugerencias. Alternativa: reutilizar `GET /people/:id` + `capacity-overview` + endpoints nuevos por bloque. Se descarta: el overview trae a todo el chapter para leer una persona, y la página sería cuatro estados de carga. El handler mock (`personDetail.handlers.ts`) cruza `getPeopleSnapshot`, `getAllocationsSnapshot`, `getSquadsSnapshot` igual que `computeCapacityOverview`, y suma sus propios seeds (`personDetail.seeds.ts`: sprints, horas, identidades, capacidades, chapter, SFIA requerido por célula/capacidad).

2. **`useReassignPerson` extraído de `ControlTowerContainer`.** Hook en `features/control-tower/hooks/` que encapsula `target`, `drawerKey`, `saving`, `serverError`, `openFor(person, opts?)` y `handleSubmit(plan)` con la semántica actual (raise → update, assign → create, move → remove + create con el mensaje explícito). `ControlTowerContainer` y `PersonDetailContainer` lo consumen; el comportamiento observable de la Torre no cambia (sus tests actuales deben seguir verdes sin tocarlos). Alternativa: copiar `handleSubmit` → dos fuentes de verdad para una regla delicada.

3. **`ReassignPersonDrawer` gana `initialMode?` e `initialTargetSquadId?`.** Necesarios para "Subir dedicación" (raise), "Mover a otra célula" (move) y "Asignar acá" (assign con destino preseleccionado). Opt-in; sin ellos el drawer se comporta como hoy. El `person` que recibe es `OverviewPerson`: el adapter del detalle produce ese mismo shape (`toOverviewPerson(detail)`) para no bifurcar el drawer, y `squads` sale de las células del detalle (`suggestedSquads` + célula actual) mapeadas a `OverviewSquad`.

4. **"Quitar de la célula" reutiliza `RemoveAllocationConfirmDialog` de allocations** con `useAllocationMutations().remove`; no pasa por el drawer.

5. **Validar horas y vincular identidad son mutaciones propias del detalle** (`personDetailService.validateHours(personId, sprint)`, `linkDevOpsIdentity(personId, identityId)`), con un hook `usePersonDetailMutations` que refetchea el detalle al terminar y usa el toast. Vincular identidad se resuelve con un `Modal` pequeño que lista las candidatas (radio) — no un drawer: es una elección de una opción.

6. **Derivaciones en el adapter, no en los componentes.** `PersonDetailAdapter.toEntity` calcula: `sfiaLevel` (seniority 1–4 → SFIA 1–4, escala Tuya), etiqueta de modalidad en español, `seniorityLabel`, antigüedad ("3 años y 3 meses" / "hace 18 días"), `assignedFte`, `realFte`, `deltaPoints`, `hoursWithinTolerance`, `expectedHoursAtDedication` (dedicación × horas del sprint), `overReportingStreak` (sprints validados seguidos por encima de lo esperado), `sfiaGap` (acorde / insuficiente), `costReading`, `busFactorOne` por capacidad, `initials` (reutiliza `getPersonInitials`) y color de avatar (mismo helper que el listado). Los componentes sólo presentan.

7. **Estructura de archivos** (espejo de `squads`/`control-tower`):
   - `pages/LeadPersonDetailPage/LeadPersonDetailPage.tsx` (lee `:id`, monta el container).
   - `features/people/PersonDetailContainer.tsx`: `usePersonDetail(id)` + breadcrumb + drawers/diálogos + mutaciones.
   - `features/people/components/detail/`: `PersonDetailHeader`, `PersonDetailStatsCards` (3 cards), `PersonAssignmentPanel` (con su variante vacía `PersonUnassignedPanel`), `HoursBySprintPanel`, `PersonCapabilitiesPanel`, `PersonProfilePanel`, `LinkDevOpsIdentityModal`.
   - `features/people/{services/personDetailService.ts, adapters/PersonDetailAdapter.ts, hooks/usePersonDetail.ts, hooks/usePersonDetailMutations.ts}`.
   - `mocks/handlers/personDetail.handlers.ts` + `personDetail.seeds.ts`.

8. **Ruta y navegación.** `personas/:id` junto a `celulas/:id` en `routes.tsx` (lazy como las demás); `navigation.ts` ya marca activa la entrada por prefijo; el breadcrumb lo publica el container con `useLeadBreadcrumb(person.name)` una vez cargado.

9. **Componentes de `tuip` usados y brechas.** Encabezado: `Avatar`, `SeniorityCard` (compacto) + texto "· SFIA n", `Badge`. Cards: `CapacityBar` (asignado vs real, con marca de "real" como línea — si `CapacityBar` no admite un marcador, se dibuja la línea encima en la app y se anota como brecha), `SegmentedBar` con `total` para BAU/Iniciativa/Libre, `DistributionCard` no aplica (no es una distribución con leyenda). Paneles: `SegmentedBar size="sm"` por sprint (apilado vertical no existe en tuip → barras verticales con divs teñidos con los mismos tokens `bg-brand-*`/`bg-neutral-*`, anotado como brecha "BarChart vertical"), `Meter` para el SFIA de capacidades, `Alert` inline o `Badge` para las señales. Ninguna brecha se resuelve creando componentes locales que dupliquen tuip: se usan tokens y se lista la brecha en tasks.

## Risks / Trade-offs

- [Extraer `useReassignPerson` toca la Torre ya terminada] → los tests existentes de `ControlTowerContainer` son la red; no se cambian, deben pasar igual.
- [El detalle depende de un change sin archivar (`add-control-tower-reassignment`)] → archivarlo primero (tarea 0); el delta de `control-tower` pasa a specs principales antes de reutilizar el drawer.
- [Mucho dato de ejemplo inventado (horas, DevOps, capacidades)] → seeds en un solo archivo, con comentario de que son ficción hasta que exista backend; los tests verifican derivaciones, no cifras.
- [`OverviewPerson` como contrato del drawer acopla dos features] → es el shape mínimo que el drawer necesita; si crece, se extrae a `shared/types`.
- [Dos changes en curso de otra sesión (`merge-dedication-and-mix-columns`, `adopt-app-shell-in-layouts`) tocan `DedicationCell` y los layouts] → el detalle usa `DedicationCell` sólo en su forma actual y no toca layouts; si `merge-…` se aplica antes, se adopta su modo nuevo en el panel Asignación.

## Open Questions

- Regla exacta de "en rango / alto / bajo" del costo por seniority: en el mock, bandas fijas por nivel en los seeds; la real la define la dimensión económica (fuera del v7).
