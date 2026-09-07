## 1. Contrato y adapter del detalle

- [x] 1.1 Quitar de `personDetailService` los tipos `HoursReportStatus`, `SprintHoursDto` y `CurrentHoursReportDto`, los campos `realFte`, `currentReport` y `sprints` de `PersonDetailDto`, y el método `validateHours`.
- [x] 1.2 Quitar `validateHours` y su mapeo de errores de `usePersonDetailMutations` (queda sólo `linkIdentity`); actualizar `usePersonDetail.test.ts` si lo referencia.
- [x] 1.3 Quitar de `PersonDetailAdapter` `sprints`, `expectedHours`, `overReportingStreak`, `hoursWithinTolerance` y el tipo `PersonDetailSprint`, junto con las pruebas que los cubren en `PersonDetailAdapter.test.ts`.

## 2. Mock del detalle

- [x] 2.1 Borrar de `personDetail.seeds.ts` `HOURS_BY_PERSON`, `SeedSprintHours`, `SPRINTS`, `SPRINT_HOURS`, `TOLERANCE`, `CURRENT_SPRINT`, `CURRENT_SPRINT_CLOSES_AT` y `CURRENT_SPRINT_SUBMITTED_AT`.
- [x] 2.2 En `personDetail.handlers.ts`, quitar `sprintsOf`, `currentReportOf`, `realFteOf`, el estado `hours`, los campos `realFte` / `currentReport` / `sprints` del `GET` y el handler `POST /people/:id/hours/:sprint/validate`.
- [x] 2.3 Actualizar `personDetail.handler.test.ts`: quitar las aserciones de reporte, sprints y FTE real; el test de validar pasa a comprobar que el `POST` de validación ya no lo atiende ningún handler; agregar el escenario "Sin datos de horas" (la respuesta no trae `realFte`, `currentReport` ni `sprints`).

## 3. La pantalla del detalle

- [x] 3.1 En `PersonDetailStatsCards`, dejar dos tarjetas: **Asignado** (asignado / disponible, barra de dedicación sin marcador del real, "<n> FTE libre" o "1.0 FTE libre" sin célula) y **Trabajo en DevOps**; borrar la tarjeta de reporte, `REPORT_STATUS` y las props `onValidateHours` / `validating`.
- [x] 3.2 Borrar `HoursBySprintPanel.tsx` y su uso en `PersonDetailContainer`; quitar del contenedor `handleValidate` y el toast de validación.
- [x] 3.3 En `PersonAssignmentPanel`, dejar sólo la señal de SFIA y quitar la de "Reporta más / lo asignado".
- [x] 3.4 Actualizar `fixtures.ts` (sin `currentReport`, `sprints`, `expectedHours`, `overReportingStreak`, `hoursWithinTolerance`, `realFte`) y `PersonDetailComponents.test.tsx`: la fila tiene dos tarjetas, no existe "Validar" ni "No aplica", la señal de sobre-reporte no se muestra, el panel de horas no se renderiza.
- [x] 3.5 En `PersonDetailContainer.test.tsx`, borrar el test "validar horas cambia el estado y recalcula el real" y ajustar el de "con célula" para que compruebe dos indicadores y ningún panel de horas.

## 4. Calendario de sprints

- [x] 4.1 `SprintConfig` pasa a `{ weeks, sprintsPerQuarter }` en `sprintConfigService`; actualizar `useSprintConfig` y las pruebas de ambos.
- [x] 4.2 En `sprint-config.handlers.ts`, quitar `hoursPerWeek` y `toleranceHours` del estado inicial y de la validación; un `PUT` sólo con los dos campos válidos responde `200`.
- [x] 4.3 En `AdminSprintsPage`, dejar los campos *Semanas por sprint* y *Sprints por quarter* y quitar las tarjetas "Reporte de horas por sprint" y "Dashboard de capacidad"; actualizar `AdminSprintsPage.test.tsx`.

## 5. Documentación y cierre

- [x] 5.1 En `context/docs/Roles_y_Permisos_Plataforma.md`, quitar las menciones al reporte de horas: el ámbito del Colaborador, las funciones y la pantalla `/app/lead/horas` del Líder de Expertise, la función del Líder Técnico y los campos de horas y tolerancia en la fila del calendario.
- [x] 5.2 Buscar restos: ninguna referencia a `realFte`, `currentReport`, `SprintHoursDto`, `validateHours`, `hoursPerWeek` ni `toleranceHours` fuera del ajuste *Horas extra* de prefacturas y del icono `hours-log`.
- [x] 5.3 Correr `tsc`, lint, prettier y la suite completa; verificar en `pnpm dev:mock` la ficha de una persona con célula (dos indicadores, Asignación con una señal, sin panel de horas) y el Calendario de sprints con dos campos.
