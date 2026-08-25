## Why

La raíz de Chapter Lead (`/app/lead`) sigue siendo un placeholder, y la única forma de saber quién tiene margen o qué célula necesita gente es recorrer célula por célula. Además el modelo vigente admite que una persona esté en varias células, cuando el alcance actual es **una persona pertenece a una sola célula**. El mockup aprobado (artifact "Torre de Control", artboards `Main` y `Rebalancear`) resuelve las dos cosas: una Torre de control con las personas con margen y la ocupación por célula, y un drawer de **reasignación** que mueve a una persona a otra célula o sube su dedicación, mostrando el resultado antes de aplicar.

## What Changes

- **Regla: una persona, una asignación.** El mock rechaza una segunda asignación para una persona que ya está en otra célula (además de RN-13, que ya impide dos en la misma). El formulario "Asignar persona" del detalle de célula ofrece **sólo personas sin célula**. Las semillas se ajustan (nadie en dos células). Desaparecen el concepto y el texto "N % en otras células": el margen de una persona es `100 − dedicación` en su única célula.
- **Torre de control** en `/app/lead` (reemplaza el placeholder):
  - Encabezado "Torre de control" con su descripción.
  - Tres cards: **FTE del chapter** (BAU / Transformación / libre con lectura "% sin asignar"), **Personas con margen** (total, sin célula, con dedicación parcial) y **Células que necesitan gente** (al tope, sin equipo).
  - Panel **Personas con margen**: sin célula primero (badge "Sin célula", acción **Asignar**), luego por margen descendente (célula, dedicación con desglose, margen, acción **Reasignar**); enlace a Personas.
  - Panel **Ocupación por célula**: al tope primero, con la `CapacityBar` de cada célula; enlace a Células.
- **Drawer Reasignar / Asignar** (`ReassignPersonDrawer`): situación actual (célula, dedicación, desglose, margen), *qué hacer con el margen* (mover a otra célula o subir la dedicación donde está; para una persona sin célula sólo "asignar a"), célula destino (sin equipo y al tope primero), dedicación y desglose, y **Así queda** (persona antes → después; célula origen y destino antes → después, con aviso si el origen queda sin equipo). Aplicar ejecuta las mutaciones de asignación existentes (quitar + crear al mover; editar al subir; crear al asignar) y refresca la Torre.
- **Contrato (sólo mock)**: nuevo `GET /chapter/capacity-overview` con el resumen, la lista de personas (con su asignación o ninguna y su margen) y la lista de células (con ocupación). `AllocationDto` pierde `personOtherSquadsPercentage`. Backend real como brecha documentada.

### Supuestos registrados

- "Dedicación parcial" = dedicación < 100 % en su célula. "Al tope" para una célula = FTE asignado ≥ FTE disponible del equipo (mismo criterio de `CapacityBar`).
- La Torre no pagina: muestra todas las personas con margen y todas las células; el chapter es pequeño (≤ 100 personas, mismo supuesto que los selectores).
- Este change asume archivados `add-squad-detail-page`, `redesign-squads-capacity-column`, `adopt-tuip-bars` y `convert-squad-forms-to-drawer`: sus deltas ya contienen el texto "en otras células" que éste retira.

### Fuera de alcance

- Alertas transversales del mockup v7 (BAU creciendo, bus factor, ingesta): dependen de datos que no existen.
- Sugerencias automáticas de rebalanceo: la decisión la toma el Chapter Lead; la Torre ordena, no recomienda.
- Backend real, `tuip`.

## Capabilities

### New Capabilities

- `control-tower`: la Torre de control del Chapter Lead — resumen de capacidad del chapter, personas con margen, ocupación por célula y el flujo de asignar/reasignar una persona con vista previa del resultado.

### Modified Capabilities

- `allocations`: nueva regla de una asignación por persona (alta sólo para personas sin célula); "Listar las asignaciones" deja de mostrar "% en otras células" (el margen es sobre su única célula).
- `chapter-lead-shell`: "Pantalla de inicio placeholder" se reemplaza por la Torre de control.
- `api-mocking`: handler de asignaciones rechaza una segunda célula para la misma persona; nuevo `GET /chapter/capacity-overview`; semillas sin personas en dos células.

## Impact

- **Frontend — nueva feature `control-tower`**: `ControlTowerContainer.tsx`, `components/ControlTowerHeader.tsx`, `ControlTowerStatsCards.tsx`, `PeopleWithMarginPanel.tsx`, `SquadOccupancyPanel.tsx`, `ReassignPersonDrawer.tsx`, `reassignValidation.ts`, `hooks/useCapacityOverview.ts`, `services/capacityOverviewService.ts`, `adapters/CapacityOverviewAdapter.ts`; `pages/ChapterLeadHomePage` pasa a montar el contenedor; `leadRouteTitles` ya dice "Torre de control".
- **Frontend — allocations**: `AllocationFormDrawer` recibe sólo personas sin célula (filtro en `AllocationsContainer` a partir del overview o de `PersonDto`); `AllocationsList` y `availabilityReading` sin "otras células"; `allocationService`/`AllocationAdapter` sin `personOtherSquadsPercentage`.
- **Mocks**: `allocations.handlers.ts` (regla, semillas: Paula sólo en Plataforma de Datos), nuevo `chapter.handlers.ts` (`capacity-overview` cruzando personas, células y asignaciones), `index.ts`.
- **Pruebas**: nuevas para la feature; ajustes en `AllocationsList.test`, `squadDetail.handler.test` (caso 40/60 desaparece), `SquadDetailContainer.test` ("0% libre · 60% en otras células"), `ChapterLeadLayout.test`/`routes.test` si dependían del placeholder.
