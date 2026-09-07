## Why

El registro de horas nunca dejó de ser ficción: el backend no lo tiene, ninguna persona reporta horas en la plataforma y todo lo que la pantalla muestra sobre ellas —el reporte del sprint, el botón *Validar*, las barras de *Horas por sprint*, el FTE real y la señal "reporta más de lo asignado"— sale de cifras sembradas en el mock. Mientras tanto el modelo real de la plataforma se decidió por otro camino: el trabajo se sigue por los **items de Azure DevOps** (la cola del Backlog ya dice que "sólo lo clasificado cuenta como FTE real"). Mantener las dos historias a la vez confunde a quien lee la ficha —¿de dónde sale ese 0.9?— y obliga a seguir sembrando y probando datos que no van a existir.

Se retira el registro de horas completo, incluidos los parámetros del calendario de sprints que sólo existían para él (horas por semana y tolerancia de reporte). El FTE real vuelve cuando salga de DevOps; hasta entonces la ficha no lo inventa.

## What Changes

- **Detalle de persona.** Desaparecen el indicador *Reporte de horas del sprint actual* (con su botón *Validar*) y el panel *Horas por sprint*. El indicador *Asignado vs real* pasa a ser **Asignado**: FTE asignado sobre disponible y lo libre, sin FTE real, sin diferencia en puntos y sin el marcador del real sobre la barra. El panel *Asignación* conserva una sola señal, la del nivel SFIA frente al requerido; la de "reporta más de lo asignado" se va con las horas. La página queda con dos indicadores y las mismas dos columnas.
- **Calendario de sprints (Admin).** El formulario conserva *Semanas por sprint* y *Sprints por quarter*; se retiran *Horas por semana*, *Tolerancia de reporte* y las dos tarjetas que explicaban el reporte de horas y la conversión de horas a FTE.
- **BREAKING** (contrato del mock, no de producción): el detalle de persona deja de devolver `realFte`, `currentReport` y `sprints`, desaparece `POST /people/{id}/hours/{sprint}/validate`, y la configuración de sprints deja de aceptar y devolver `hoursPerWeek` y `toleranceHours`.
- **Documentación.** El doc de roles deja de listar el reporte de horas como función, pantalla o pendiente.

### Fuera de alcance

- Calcular el FTE real a partir de los items de DevOps: es otro change, cuando exista la ingesta.
- El ajuste *Horas extra* de las prefacturas: es un motivo de ajuste de facturación, no un reporte de horas, y se queda.
- El icono `hours-log` del sistema de diseño y sus usos como icono (ausencias, plazo de una iniciativa): es un glifo, no una funcionalidad.
- El backend .NET: no tiene nada de horas.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `people`: el requisito **Detalle de persona** pierde el indicador de reporte de horas, el panel *Horas por sprint* y todo lo derivado de horas (FTE real, diferencia, señal de sobre-reporte); *Asignado vs real* pasa a ser *Asignado*.
- `api-mocking`: el requisito **Handler de mock para el detalle de una persona** deja de servir horas, reporte, sprints y FTE real, y pierde el `POST` de validación; el requisito **Handler de mock para la configuración de sprints** fija la configuración en semanas por sprint y sprints por quarter.
- `admin-shell`: el requisito **Pantallas placeholder de Admin** describe el formulario del Calendario de sprints sin campos de horas ni tolerancia.

## Impact

- **Frontend, `features/people`**: `personDetailService` (tipos `SprintHoursDto`, `CurrentHoursReportDto`, `HoursReportStatus` y `validateHours`), `PersonDetailAdapter` (`sprints`, `expectedHours`, `overReportingStreak`, `hoursWithinTolerance`), `PersonDetailStatsCards` (dos tarjetas y `REPORT_STATUS`), `HoursBySprintPanel` (se borra), `PersonAssignmentPanel` (señal), `PersonDetailContainer` y `usePersonDetailMutations` (validar), con sus pruebas y fixtures.
- **Frontend, `features/admin-shell` y `pages/AdminSprintsPage`**: `SprintConfig`, `sprintConfigService`, `useSprintConfig`, la página y sus pruebas.
- **Mocks**: `personDetail.seeds.ts` (`HOURS_BY_PERSON`, `SPRINTS`, `SPRINT_HOURS`, `TOLERANCE`, `CURRENT_SPRINT*`), `personDetail.handlers.ts` (horas, reporte, FTE real, validación), `sprint-config.handlers.ts` (campos y validación) y sus pruebas.
- **Lo que cambia de lectura**: la ficha ya no responde "¿cuánto trabajó realmente?"; hasta que DevOps lo diga, responde "¿cuánto tiene asignado y cuánto le queda libre?". Es una pérdida deliberada, no un hueco: la spec lo dice.
- **Docs**: `context/docs/Roles_y_Permisos_Plataforma.md` menciona el reporte de horas en el rol Colaborador, en las funciones y pantallas del Líder de Expertise y en la del Líder Técnico; se ajusta para que no describa una función que no existe.
