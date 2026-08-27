## Why

El formulario de alta de ausencias pide el tipo con un desplegable para tres opciones, en un drawer de 720px que termina con media pantalla vacía: el usuario tiene que abrir una lista para ver algo que cabe entero a la vista. Además el encabezado de sección desalinea su título respecto del icono. Las dos cosas se revisaron en una propuesta de diseño y quedaron aprobadas.

Aparte de eso, hoy sólo se pueden pedir días completos. Una ausencia real muchas veces empieza o termina a mediodía —salir el jueves después de comer, volver el lunes por la tarde— y con el modelo actual hay que redondear a un día entero, que es justo lo que descuenta capacidad de más.

## What Changes

- **El tipo se elige directamente**: tres opciones a la vista (Vacaciones, Permiso, Incapacidad), cada una con su icono y su estado seleccionado, en lugar del desplegable.
- **Medias jornadas en los extremos del rango**: el primer día y el último día pueden marcarse como media jornada. Un rango de un solo día marcado a medias es media jornada. No se registra si es mañana o tarde: para capacidad media jornada es 0.5 venga cuando venga (decisión del usuario al proponer el change).
- El conteo de días hábiles pasa a admitir múltiplos de 0.5 y se muestra con ese decimal donde hoy se muestra entero: el resumen del formulario, la columna "Días" de la tabla y el pie "N días hábiles ausentes" de la card del mes. Un valor entero se sigue mostrando sin decimales.
- El impacto en capacidad se calcula con esos días fraccionados, sin cambiar la fórmula: media jornada descuenta la mitad que un día.
- **El contrato del mock gana dos campos** (`startsHalfDay`, `endsHalfDay`) y sus días pasan a ser fraccionarios. El backend todavía no conoce las ausencias, así que el contrato lo sigue fijando el mock.
- **El encabezado de sección de formulario se alinea**: el `h3` deja de arrastrar el margen que lo sube 6px respecto del icono. Vive en `FormSection`, así que el arreglo cae en los once formularios que lo usan.
- El resumen de días hábiles del formulario pasa a mostrarse como una tira bajo el rango, como consecuencia de las fechas y de las medias jornadas elegidas.

## Capabilities

### New Capabilities
- `absence-half-days`: el modelo de media jornada — dónde puede pedirse, cómo se cuenta, cómo se muestra allí donde se cuentan días y cómo afecta al descuento de capacidad.
- `absence-registration`: la anatomía del formulario de alta — qué pide, cómo se elige el tipo, qué resume antes de enviar y qué valida.
- `form-section-header`: el encabezado de sección de formulario compartido — icono en pastilla y título, y su alineación.

### Modified Capabilities
<!-- Ninguna. `absences-table-filtering` no cambia: filtrar y paginar no dependen
     del conteo de días. `absences-month-view` (del change `compactar-vista-ausencias`,
     aún sin archivar) tampoco: no fija cómo se formatean los días de una fila. -->

## Impact

- `src/features/absences/services/absenceService.ts`: `AbsenceDto` y `CreateAbsenceRequest` ganan `startsHalfDay`/`endsHalfDay`; `businessDays` y `businessDaysInMonth` pasan a fraccionarios.
- `src/features/absences/services/businessDays.ts`: `countBusinessDays` admite las dos marcas de media jornada; nueva función para formatear días (entero sin decimal, medio con `.5`).
- `src/mocks/handlers/absences.handlers.ts` y sus semillas: aceptan y devuelven los campos nuevos; una semilla de ejemplo con media jornada.
- `src/features/absences/components/RegisterAbsenceDrawer.tsx`: tipo en tres opciones seleccionables, controles de media jornada por extremo, tira de resumen.
- `src/features/absences/components/AbsencesTable.tsx` y `AbsencesStatsCards.tsx`: días formateados con el decimal cuando lo hay.
- `src/features/absences/adapters/AbsenceAdapter.ts`: suma de días del mes con fracciones.
- `src/shared/components/FormSection.tsx`: `h3` sin margen.
- Tests: `businessDays.test.ts` (medias jornadas), `RegisterAbsenceDrawer.test.tsx`, `AbsencesContainer.test.tsx`, `AbsencesStatsCards.test.tsx`, `absences.handler.test.ts`, y un test del encabezado de sección.
- Fuera de alcance: registrar si la media jornada es de mañana o de tarde; medias jornadas en días interiores del rango; tocar la aprobación/rechazo, el filtrado o la paginación de la tabla.
