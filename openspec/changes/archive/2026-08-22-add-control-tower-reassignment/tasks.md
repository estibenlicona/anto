## 0. Prerrequisito

- [x] 0.1 Archivar `add-squad-detail-page`, `redesign-squads-capacity-column`, `adopt-tuip-bars` y `convert-squad-forms-to-drawer` (sync de specs incluido), para que este change parta del spec principal ya actualizado.

## 1. Regla "una persona, una célula" (mock y asignaciones)

- [x] 1.1 En `allocations.handlers.ts`, rechazar con 400 el `POST` para una persona que ya tiene asignación en cualquier célula; quitar `personOtherSquadsPercentage` del enriquecimiento; ajustar semillas (Paula sólo en Plataforma de Datos 60 %; Isabella Moreno 50 % en Backend Platform) sin personas duplicadas.
- [x] 1.2 Quitar `personOtherSquadsPercentage` de `AllocationDto`, `Allocation`, `AllocationAdapter` y de `availabilityReading` en `AllocationsList` (queda "N% libre" / "0% libre").
- [x] 1.3 Tests: `squadDetail.handler.test` (400 para persona ya asignada; semillas sin duplicados; margen 20 para María), `AllocationAdapter.test`, `AllocationsList.test` (sin "otras células"), `SquadDetailContainer.test` y `squads.handler.test` (nuevos conteos de Backend Platform).

## 2. Resumen de capacidad del chapter (mock y servicio)

- [x] 2.1 Exportar `getSquadsSnapshot()` desde `squads.handlers.ts`; crear `mocks/handlers/chapter.handlers.ts` con `GET /chapter/capacity-overview` según design D1; registrarlo en `handlers/index.ts`.
- [x] 2.2 Crear `features/control-tower/services/capacityOverviewService.ts` (`getOverview()`), `adapters/CapacityOverviewAdapter.ts` (entidad UI + ordenamientos `peopleWithMargin`, `squadsByNeed`, `unassignedPeople`) y `hooks/useCapacityOverview.ts`.
- [x] 2.3 Tests: `chapter.handler.test.ts` (indicadores coherentes con personas/células/asignaciones; `marginPercentage`; refleja una mutación), `CapacityOverviewAdapter.test` (ordenamientos), `useCapacityOverview.test`.

## 3. Torre de control (UI)

- [x] 3.1 Crear `components/ControlTowerHeader.tsx` y `ControlTowerStatsCards.tsx` (DistributionCard de FTE con BAU/Transf./libre y pie "% sin asignar"; cards de personas con margen y de células que necesitan gente; `null` en carga/error).
- [x] 3.2 Extraer la celda de dedicación (nombre de célula + %, barra BAU/Transf. + texto) de `AllocationsList` a `shared/components/DedicationCell.tsx` y usarla en ambos lugares.
- [x] 3.3 Crear `PeopleWithMarginPanel.tsx` (tabla: persona, célula y dedicación o badge "Sin célula", margen en FTE, botón Asignar/Reasignar; pie con las personas al tope; enlace a Personas; estado vacío) y `SquadOccupancyPanel.tsx` (lista con `CapacityBar`, badge de criticidad y personas; enlace a Células).
- [x] 3.4 Crear `ControlTowerContainer.tsx` (compone header, cards, paneles; estados carga/error con reintento) y montarlo en `pages/ChapterLeadHomePage` en lugar del placeholder.
- [x] 3.5 Tests: `ControlTowerStatsCards.test`, `PeopleWithMarginPanel.test` (orden, filas sin célula y parciales, botones), `SquadOccupancyPanel.test` (orden, sin equipo), `ControlTowerContainer.test` con el mock real; ajustar `ChapterLeadLayout.test`/`routes.test` si referenciaban el placeholder.

## 4. Drawer de reasignación

- [x] 4.1 Crear `reassignValidation.ts` (modo, destino, dedicación, desglose; `countMissingRequiredFields`) y su test.
- [x] 4.2 Crear `ReassignPersonDrawer.tsx` según design D4 (situación actual, qué hacer con el margen, destino ordenado por necesidad, dedicación + desglose con sufijo %, bloque "Así queda" con aviso de origen sin equipo, pie con lectura y botones).
- [x] 4.3 En `ControlTowerContainer`, cablear `onSubmit(plan)` con `useAllocationMutations` (assign → create; raise → update; move → remove + create con el mensaje explícito si falla la creación), toast, cierre y `refetch`.
- [x] 4.4 Tests: `ReassignPersonDrawer.test` (modo por persona, destino fijo en "subir", "Así queda", validación, contador), `ControlTowerContainer.test` (asignar a persona sin célula y mover con el mock real refrescan la Torre; fallo en la creación tras quitar muestra el mensaje).

## 5. Alta de asignación sólo con personas sin célula

- [x] 5.1 En `AllocationsContainer`, reemplazar `usePeople(100)` por `useCapacityOverview().unassignedPeople` para el selector del alta (en edición no hay selector); adaptar `AllocationFormDrawer` si su tipo de `people` cambia.
- [x] 5.2 Tests: `AllocationsContainer.test` (el selector no ofrece a personas ya asignadas).

## 6. Verificación

- [x] 6.1 `npx vitest run` + typecheck + lint sin regresiones frente al baseline (fallos pre-existentes: `App.test.tsx`, `httpClient.test.ts`); `grep` de que no queda `personOtherSquadsPercentage` ni "otras células".
- [x] 6.2 Navegador en modo mock: `/app/lead` muestra la Torre con cards, personas con margen (sin célula primero) y ocupación por célula; "Asignar" a Diego Salazar en Pagos Instantáneos y "Reasignar" (mover) a Valentina Ospina refrescan la Torre y el listado de Células; el alta desde el detalle sólo ofrece personas sin célula; comparar contra el artifact "Torre de Control".
