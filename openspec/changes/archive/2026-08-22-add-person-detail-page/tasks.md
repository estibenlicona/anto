## 0. Prerrequisito

- [x] 0.1 Archivar `add-control-tower-reassignment` (sync de specs incluido) para que `control-tower` exista en los specs principales antes de reutilizar su drawer.

## 1. Mock del detalle de persona

- [x] 1.1 Crear `mocks/handlers/personDetail.seeds.ts`: sprints (S11–S16, 80 h, tolerancia 76–84), horas por persona y sprint (BAU / Iniciativa / Libre + estado), identidades DevOps (vinculadas y candidatas) con items por tipo y pendientes de curación, capacidades por persona (nombre, SFIA, principal) y cobertura en el chapter, chapter + lead, SFIA requerido por célula y capacidad, bandas de costo por seniority, vigencia de contrato de externas. Al menos: María con `Submitted` y exceso 3 sprints + AS-400 bus factor 1; Camila sin identidad y sin horas.
- [x] 1.2 Crear `mocks/handlers/personDetail.handlers.ts` con `GET /people/:id/detail` (deriva asignación, célula, compañeros y células sugeridas de `getPeopleSnapshot` / `getAllocationsSnapshot` / `getSquadsSnapshot`; 404 si no existe), `POST /people/:id/hours/:sprint/validate` (200 → `Validated`, 409 si no está `Submitted`) y `POST /people/:id/devops-identity` (200, 404 identidad desconocida); `resetPersonDetailMock()`; registrar en `handlers/index.ts`.
- [x] 1.3 Tests `personDetail.handler.test.ts`: con célula, sin célula (sugerencias con SFIA requerido), sigue a una mutación de asignaciones, validar (200/409 y FTE real recalculado), vincular (200/404), 404 de persona.

## 2. Servicio, adapter y hooks

- [x] 2.1 `features/people/services/personDetailService.ts` (`getDetail`, `validateHours`, `linkDevOpsIdentity`) con los DTOs.
- [x] 2.2 `features/people/adapters/PersonDetailAdapter.ts` con `toEntity` (derivaciones de design D6: SFIA, modalidad en español, antigüedad, FTE asignado/real/delta, tolerancia, horas esperadas, racha de exceso, brecha SFIA, lectura de costo, bus factor, iniciales y color) y `toOverviewPerson` para el drawer (las células del drawer salen de `useCapacityOverview().squadsByNeed`, la misma lista que la Torre: en modo mover hacen falta todas, no sólo las sugeridas).
- [x] 2.3 `hooks/usePersonDetail.ts` (`detail`, `loading`, `error`, `refetch`, `notFound`) y `hooks/usePersonDetailMutations.ts` (`validateHours`, `linkIdentity`).
- [x] 2.4 Tests del adapter (cada derivación con caso límite: sin sprints, externa, sin identidad, SFIA insuficiente) y del hook.

## 3. Reutilización de la reasignación de la Torre

- [x] 3.1 Extraer `useReassignPerson` a `features/control-tower/hooks/useReassignPerson.ts` (estado del drawer + `handleSubmit` con mover = quitar + crear y su mensaje) y hacer que `ControlTowerContainer` lo consuma; sus tests actuales siguen pasando sin cambios.
- [x] 3.2 Añadir a `ReassignPersonDrawer` las props opcionales `initialMode` e `initialTargetSquadId`; test de que arranca en `raise` con destino fijo y en `assign` con destino preseleccionado.

## 4. Componentes del detalle

- [x] 4.1 `components/detail/PersonDetailHeader.tsx`: avatar, nombre, `SeniorityCard` + "· SFIA n", vinculación, "Sin célula", cargo · rol, modalidad, correo, estado DevOps; acciones Editar / Reasignar | Asignar a una célula / menú Eliminar.
- [x] 4.2 `PersonDetailStatsCards.tsx`: Asignado vs real (`CapacityBar` + marca de real), Reporte de horas del sprint (`SegmentedBar` BAU/Iniciativa/Libre con `total`, badge de estado, botón Validar sólo en `Submitted`, "No aplica" sin célula), Trabajo en DevOps (items, pendientes de curación, o "Sus items no cuentan" + Vincular identidad).
- [x] 4.3 `PersonAssignmentPanel.tsx` (célula con badge de criticidad, tribu, compañeros, desde cuándo, dedicación con `DedicationCell`, libre, señales SFIA y exceso, acciones Subir / Mover / Quitar) y `PersonUnassignedPanel.tsx` (estado vacío + células que piden su capacidad con "Asignar acá").
- [x] 4.4 `HoursBySprintPanel.tsx`: barras verticales apiladas por sprint con tokens de tuip, sprint no validado atenuado, línea de lo asignado, leyenda y estado vacío.
- [x] 4.5 `PersonCapabilitiesPanel.tsx` (capacidad, principal, cobertura, `Meter`/medidor SFIA, badge "Bus factor 1") y `PersonProfilePanel.tsx` (ficha: chapter y lead, ingreso + antigüedad, FTE declarado, costo + lectura, proveedor + vigencia si externa, documento, identidad DevOps).
- [x] 4.6 `LinkDevOpsIdentityModal.tsx` (lista de candidatas, radio, confirmar).
- [x] 4.7 Tests de componentes: header en ambos estados, cards (Validar sólo en `Submitted`; "No aplica"; sin identidad), panel de asignación (señales, acciones disparan el callback con el modo), panel vacío ("Asignar acá" con el squadId), horas (vacío / con datos), capacidades (bus factor), ficha (externa vs interna; nada del encabezado repetido).

## 5. Container, página y ruta

- [x] 5.1 `features/people/PersonDetailContainer.tsx`: `usePersonDetail`, `useLeadBreadcrumb(nombre)`, estados de carga / error / no encontrada (enlace al listado), composición de paneles, `useReassignPerson` + `ReassignPersonDrawer` (modos desde header y panel; "Asignar acá" con destino), `RemoveAllocationConfirmDialog` para Quitar, `PersonFormDrawer` para Editar, `DeletePersonConfirmDialog` para Eliminar (vuelve al listado), `LinkDevOpsIdentityModal`, Validar horas; toast + `refetch` tras cada mutación.
- [x] 5.2 `pages/LeadPersonDetailPage/LeadPersonDetailPage.tsx` y ruta `personas/:id` en `routes.tsx`; test de rutas (entrada "Personas" activa y breadcrumb con el nombre).
- [x] 5.3 Test `PersonDetailContainer.test.tsx` con el mock real: render con célula; sin célula; validar horas cambia el estado y el FTE real; quitar de la célula deja "Sin célula"; reasignar refresca; id inexistente.

## 6. Verificación

- [x] 6.1 `npx vitest run`, typecheck y lint (sólo los fallos baseline conocidos); prettier en archivos tocados.
- [x] 6.2 Revisión en navegador de `/app/lead/personas/:id` contra el canvas "Detalle de Persona": María (con célula, Validar, señales, bus factor) y Camila (sin célula, Vincular identidad, Asignar acá → drawer con destino); navegación desde el listado y desde la Torre; breadcrumb.
- [x] 6.3 Anotar en `proposal.md` (sección Impact) las brechas de tuip detectadas (marcador de "real" en `CapacityBar`, barras verticales apiladas) para un change posterior en tuip.
