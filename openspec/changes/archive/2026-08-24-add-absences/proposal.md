## Why

El chapter gestiona vacaciones, permisos e incapacidades por fuera de la plataforma (correo y memoria), así que la capacidad que las pantallas muestran no descuenta a los ausentes y la revisión de facturas de terceros no tiene contra qué comparar. Esta es la primera mitad de la Fase A de la propuesta de diseño "Facturación de Terceros y Ausencias": la ausencia se registra una sola vez y de ahí saldrán el descuento de la factura (change siguiente, `add-provider-billing`), el FTE del período y la capacidad del sprint (fase C).

## What Changes

- Nueva pantalla "Ausencias" para el Chapter Lead en `/app/lead/ausencias`: listado por mes (navegable), KPIs del período (ausencias y días, impacto en FTE de lo aprobado, solicitudes por aprobar), alta por drawer y aprobación/rechazo por fila.
- Ciclo de estados: toda ausencia nace `Solicitada`; el Chapter Lead la aprueba o la rechaza (el rechazo exige motivo y queda trazado, mismo patrón que la curación del backlog). Sólo lo aprobado cuenta como impacto.
- Impacto en capacidad calculado, no digitado: días hábiles ausentes dentro del mes ÷ días hábiles del mes × FTE disponible de la persona, repartido entre sus células según la dedicación.
- Nueva entrada "Ausencias" en el grupo "Capacidad" del menú lateral del Chapter Lead (después de Personas).
- Handler de mock para ausencias (listar por mes, alta con validación de solape, aprobar/rechazar), con impactos derivados del snapshot de personas y asignaciones.

Queda explícitamente fuera (registrado para los siguientes changes): la conciliación de facturas (`add-provider-billing`), las señales de ausencia en detalle de célula / Torre / sprint (fase C), la solicitud por la propia persona (no existe todavía el shell de Colaborador) y el backend .NET (la app sigue el patrón de mocks del resto de capacidades).

## Capabilities

### New Capabilities

- `absences`: registro y aprobación de ausencias del chapter (vacaciones, permisos, incapacidades) con su impacto calculado en la capacidad del período.

### Modified Capabilities

- `chapter-lead-shell`: la navegación lateral gana la entrada "Ausencias" en el grupo "Capacidad".
- `api-mocking`: se agrega el handler de mock para ausencias (requirement nuevo; no cambia ningún handler existente).

## Impact

- Frontend: nueva feature `src/features/absences` (contenedor, componentes, hooks, adapter, service), ruta y entrada de navegación en `chapter-lead-shell`, handlers en `src/mocks`.
- Sin cambios en `tuip`: la pantalla se compone con Card, Table, Badge, Tag, Drawer, Alert y el vocabulario ya publicado.
- Sin cambios en pantallas existentes: el −FTE en célula/Torre/sprint es fase C, deliberadamente.
- Deltas de spec en unión con los changes activos que también modifican la navegación (`add-backlog-triage`, `add-initiative-evaluation`): el delta de este change parte del texto más completo pendiente y sólo suma "Ausencias".
