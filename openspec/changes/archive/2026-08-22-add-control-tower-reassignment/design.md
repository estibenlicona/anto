## Context

Ver proposal.md - Why y el artifact "Torre de Control". Estado que condiciona:

- `ChapterLeadHomePage` es un placeholder con `Card`; `leadRouteTitles[LEAD_HOME_ID]` ya es "Torre de control".
- `allocations.handlers.ts` enriquece cada asignación desde `people.handlers.ts` y calcula `personAvailablePercentage` / `personOtherSquadsPercentage` sumando *todas* las asignaciones de la persona; las semillas tienen a Paula Ramírez en dos células (40 % Backend + 60 % Datos), hecho a propósito para el caso "en otras células".
- `AllocationsContainer` pasa a `AllocationFormDrawer` la lista completa de `usePeople(100)`.
- `AllocationsList.availabilityReading` tiene la rama "0% libre · N% en otras células".
- Componentes disponibles en `tuip`: `CapacityBar`, `DistributionCard`, `Meter`, `SegmentedBar` (`total`, `size`), `Drawer`, `Badge`, `Avatar`, `Select`, `Input` (`suffix`, `hint`, `required`), `EmptyState`; `FormSection` en `shared/components`.
- Hooks de mutación existentes: `useAllocationMutations` (`create(squadId, values)`, `update(allocation, values)`, `remove(allocation)`), todos devuelven `{ success, error }`.

## Goals / Non-Goals

**Goals:**
- Torre de control fiel al mockup, construida con los componentes del sistema y la feature `allocations` existente (sin nuevas mutaciones).
- Regla "una persona, una célula" aplicada en mock, formulario y semillas.
- Un solo `GET` agregado para la Torre.

**Non-Goals:**
- Transacción atómica para "mover" (no hay endpoint): se hace quitar + crear y se reporta honestamente un fallo a mitad de camino.
- Paginación o filtros en la Torre.

## Decisions

### D1. Contrato `GET /chapter/capacity-overview`

```ts
export interface CapacityOverviewDto {
  chapterFte: number; bauFte: number; transformationFte: number; freeFte: number;
  peopleTotal: number; peopleUnassigned: number; peoplePartial: number;
  squadsAtCapacity: number; squadsWithoutTeam: number;
  people: {
    id: string; name: string; position: string; seniorityLabel: string; availableFte: number;
    allocation: { id: string; squadId: string; squadName: string;
                  dedicationPercentage: number; bauPercentage: number; transformationPercentage: number } | null;
    marginPercentage: number;        // 100 si no tiene célula; 100 − dedicación si tiene
  }[];
  squads: {
    id: string; name: string; criticality: Criticality; memberCount: number;
    allocatedFte: number; teamAvailableFte: number; bauFte: number; transformationFte: number;
  }[];
}
```
- Una sola llamada porque la Torre necesita los tres bloques a la vez y el drawer reutiliza `squads` para el selector destino y el "Así queda".
- `freeFte = chapterFte − bauFte − transformationFte` (≥ 0). `peoplePartial` = con asignación y dedicación < 100. `squadsAtCapacity` = `memberCount > 0 && allocatedFte >= teamAvailableFte`.
- Mock en `chapter.handlers.ts` (nuevo) con `getPeopleSnapshot`/`getAllocationsSnapshot`/un nuevo `getSquadsSnapshot` exportado desde `squads.handlers.ts` (misma excepción documentada de lectura unidireccional).

### D2. Regla "una persona, una célula"

- Mock: en `POST /squads/:id/allocations`, si `allocations.some(a => a.personId === body.personId)` → 400 "La persona ya está asignada a otra célula" (cubre también RN-13).
- Semillas: Paula Ramírez pasa a tener sólo 60 % en Plataforma de Datos (se borra `seed(4, …, BACKEND, 40, 40)`); Backend Platform queda con 3 personas → el test de "+N" en `SquadsList` usa su propio fixture, pero `squads.handler.test` ("memberCount > 3") y `SquadDetailContainer.test` ("4 personas", "0% libre · 60% en otras células") se ajustan. Para conservar un "+N" real en las semillas se agrega a Isabella Moreno (`phhhhhhh…`) a Backend Platform con 50 % (30/20).
- `personOtherSquadsPercentage` se elimina del DTO, del adapter, de `availabilityReading` (queda `"N% libre"` en éxito si > 0, `"0% libre"` neutro si no) y del test.
- `AllocationsContainer`: `people` filtradas a las que no tienen asignación. Hoy `PersonDto` no trae su asignación; se usa el overview: `useCapacityOverview` expone `unassignedPeople`, y `AllocationsContainer` lo consume en lugar de `usePeople` para el selector. En edición no se muestra selector, así que no hay pérdida.

### D3. Feature `control-tower`

```
ControlTowerContainer
├── useCapacityOverview() → overview | loading | error | refetch
├── ControlTowerHeader
├── ControlTowerStatsCards   (DistributionCard "FTE del chapter" con tone slate/blue + color gray para libre,
│                              Card "Personas con margen", Card "Células que necesitan gente")
├── grid 7/5
│   ├── PeopleWithMarginPanel (tabla; filas: Avatar+nombre+cargo·seniority | célula+Meter-like desglose | margen | botón)
│   └── SquadOccupancyPanel   (lista; CapacityBar por célula, Badge criticidad, personas)
└── ReassignPersonDrawer     (abierto con la persona elegida)
```
- "Libre" en la `DistributionCard` de FTE: `color: "gray"` (categórico) — no es una parte con tono de acento ni un estado; el punto de leyenda lleva borde como `heat: low`. Pie: "N% del FTE del chapter sin asignar".
- Fila de persona con célula: nombre de célula + `%` a la derecha, `SegmentedBar size="sm" total={100}` con BAU/Transf. en `MIX_TONES`, y "BAU a% · Transf. b%" debajo — la misma celda que `AllocationsList` ya dibuja; se extrae a `shared/components/DedicationCell.tsx` para no duplicarla.
- Margen en FTE: `availableFte × marginPercentage / 100` con un decimal; color éxito si la persona tiene célula, peligro si no (la fila "Sin célula" es la que más urge).
- Orden: `people.filter(margin > 0).sort(unassigned first, then margin desc)`; `squads.sort(withoutTeam, atCapacity, then by free asc)`.

### D4. `ReassignPersonDrawer`

- Props: `open`, `onOpenChange`, `person` (item del overview), `squads` (del overview), `saving`, `serverError`, `onSubmit(plan)`.
- Estado: `mode: "move" | "raise" | "assign"` (assign fijo si no tiene célula; `move` por defecto si tiene), `targetSquadId`, `dedication`, `bau`, `transformation`. Al elegir `raise`, destino = su célula actual (fijo) y la dedicación arranca en la actual.
- Validación en `reassignValidation.ts`: destino obligatorio (salvo `raise`), dedicación 1–100 (en `raise` > actual), desglose suma = dedicación; reutiliza las reglas de `allocationFormValidation` para los porcentajes.
- "Así queda" calculado en el cliente desde `overview`: persona (célula/dedicación antes → después), origen (`allocatedFte − dedicación_actual×availableFte/100`, "queda sin equipo" si `memberCount === 1`), destino (`allocatedFte + dedicación_nueva×availableFte/100`, sobre `teamAvailableFte + availableFte`). Se muestra sólo cuando el plan es válido.
- Pie: "Después del cambio: N personas con margen · M células sin equipo", botones Cancelar / "Reasignar" | "Asignar".
- `onSubmit(plan)` en el contenedor, con `useAllocationMutations`:
  - `assign` → `create(target, values)`
  - `raise` → `update(allocation, values)`
  - `move` → `remove(allocation)`; si falla, error y fin; si ok → `create(target, values)`; si falla la creación, `serverError` = motivo + "La asignación anterior ya fue quitada: volvé a asignar a la persona." (honesto, sin transacción).
  - Éxito → toast, cerrar, `refetch()`.

### D5. Pruebas

- Handler `chapter.handler.test.ts`: indicadores derivados de los otros endpoints; `marginPercentage`; orden no (lo ordena el cliente); refleja una mutación.
- `allocations.handlers`: 400 al asignar a persona ya asignada; semilla sin duplicados (ninguna persona con 2 asignaciones).
- `reassignValidation.test.ts`; `ReassignPersonDrawer.test.tsx` (modos, destino, "Así queda", validación); `PeopleWithMarginPanel.test` (orden, filas, botones); `ControlTowerStatsCards.test`; `ControlTowerContainer.test` con mock real (render, abrir drawer, asignar a persona sin célula refresca).
- Ajustes: `AllocationsList.test` (sin "otras células"), `squadDetail.handler.test`, `SquadDetailContainer.test`, `AllocationsContainer.test` (selector sólo sin célula), `routes.test`/`ChapterLeadLayout.test` si buscaban el placeholder.

## Risks / Trade-offs

- [Mover = dos llamadas sin transacción] → Se ejecuta quitar → crear y, si la segunda falla, se informa explícitamente que la persona quedó sin célula; reaparece en la Torre como "Sin célula", así que el estado sigue siendo visible y corregible. Cuando exista el backend real, un endpoint `PUT /allocations/:id/move` lo vuelve atómico sin cambiar la UI.
- [Cambiar las semillas rompe fixtures existentes] → Listados en D2 y D5; se corrigen en el mismo change.
- [`AllocationsContainer` pasa a depender del overview para el selector] → Es una llamada más al abrir el detalle; aceptable (chapter pequeño). Alternativa descartada: agregar `squadId` a `PersonDto` (toca people y su mock por un solo uso).
- [Cuatro changes de la app sin archivar] → Se archivan antes de aplicar éste (proposal - Supuestos) para que los deltas de "otras células" no vuelvan a entrar.
