## ADDED Requirements

### Requirement: Handler de mock para ausencias
El sistema SHALL exponer un handler de mock con `GET` listado de ausencias filtrado por mes (`month=YYYY-MM`, devuelve las ausencias cuyo rango toca ese mes junto con los días hábiles del mes pedido), `POST` alta (400 si el rango es inválido o se solapa con otra ausencia no rechazada de la misma persona), y `PUT` de estado a un sub-recurso (`Aprobada` sólo desde `Solicitada`; `Rechazada` sólo desde `Solicitada` y con motivo obligatorio; 400 en otro caso, 404 si no existe). Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio.

Cada ausencia SHALL llevar `id`, `personId`, `personName`, `providerName | null`, `type` (`Vacation | Leave | SickLeave`), `startDate`, `endDate`, `businessDays` (días hábiles L–V del rango completo), `status` (`Requested | Approved | Rejected`), `rejectReason | null`, y — calculados para el mes pedido — `businessDaysInMonth` y `squadImpacts` (`squadId`, `squadName`, `dedicationPct`, `fteImpact`). Los impactos SHALL derivarse de los datos de personas y asignaciones del propio mock (FTE disponible y dedicaciones vigentes), no de valores digitados, usando los mismos ids y nombres que esos handlers.

Los datos de ejemplo SHALL incluir ausencias de los tres tipos y los tres estados, de personas de terceros y de planta, y al menos una que cruza un fin de mes, con fechas relativas al mes corriente para que la pantalla abra con contenido. El cálculo SHALL repartir el impacto entre varias asignaciones en proporción a su dedicación cuando existan, aunque el mundo semilla de asignaciones tenga hoy una célula por persona — el reparto se cubre a nivel del cálculo, no de las semillas.

#### Scenario: Listar por mes
- **WHEN** se hace un `GET` con `month=2026-07`
- **THEN** responde las ausencias que tocan julio — incluidas las que empiezan en junio o terminan en agosto — con `businessDaysInMonth` y `squadImpacts` calculados sólo sobre los días hábiles de julio

#### Scenario: Alta con solape
- **WHEN** se hace un `POST` con un rango que se cruza con otra ausencia Solicitada o Aprobada de la misma persona
- **THEN** responde 400 con un problema que explica el conflicto y no crea nada

#### Scenario: Cambiar el estado
- **WHEN** se aprueba una Solicitada, o se rechaza una Solicitada con motivo
- **THEN** responde la ausencia actualizada; rechazar sin motivo o transicionar desde Aprobada/Rechazada responde 400, y un id inexistente 404
