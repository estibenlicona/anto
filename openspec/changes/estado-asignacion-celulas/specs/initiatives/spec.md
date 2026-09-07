## REMOVED Requirements

### Requirement: Cambiar el estado de una iniciativa
**Reason**: La regla "una célula sostiene como mucho una iniciativa activa a la vez" contradice la operación real: una célula sostiene varias iniciativas en paralelo, y mientras exista la demanda por célula nunca puede sumar más de una. El requisito se reemplaza completo porque su escenario de rechazo del servidor deja de existir.
**Migration**: El requisito "Activar y cerrar iniciativas" (agregado en este change) conserva activar sólo con evaluación guardada, cerrar sólo activas, el menú con acciones deshabilitadas y las confirmaciones; retira el rechazo de la segunda activación en pantalla, mock y contrato (`squadHasOtherActive`). El backend real se alinea en un change `backend-modulo-*` aparte.

## ADDED Requirements

### Requirement: Activar y cerrar iniciativas
El sistema SHALL permitir **Activar** una iniciativa sólo si tiene talla (evaluación guardada), y **Cerrar** sólo si está activa. Una célula SHALL poder sostener **varias iniciativas activas a la vez**: cuántas iniciativas activas o en evaluación tiene una célula NO SHALL estar limitado, y activar una iniciativa NO SHALL depender del estado de las demás iniciativas de su célula. Cada activación suma la demanda de esa iniciativa a su célula (ver capacidad `squads`).

Las acciones no disponibles SHALL mostrarse deshabilitadas en el menú de la fila, con el mismo tratamiento con que hoy se deshabilita "Activar" sin talla: el menú NO SHALL explicar el motivo. Activar SHALL pedir confirmación indicando que la iniciativa pasará a contar como demanda; cerrar SHALL pedir confirmación.

#### Scenario: Activar sin talla
- **WHEN** el Chapter Lead abre el menú de una iniciativa sin evaluación guardada
- **THEN** "Activar" está deshabilitado

#### Scenario: Activar con la célula ya ocupada
- **WHEN** el Chapter Lead activa una iniciativa evaluada cuya célula ya tiene otra iniciativa activa, y confirma
- **THEN** la activación procede: ambas iniciativas quedan activas, las dos cuentan en la card de activas y en el FTE demandado, y ninguna pantalla ofrece cerrar la anterior como requisito

#### Scenario: Varias iniciativas en evaluación en la misma célula
- **WHEN** una célula tiene dos iniciativas en evaluación y ninguna activa
- **THEN** ambas se pueden evaluar y activar, y activar una no impide activar la otra

#### Scenario: Activar una iniciativa evaluada
- **WHEN** el Chapter Lead activa una iniciativa con talla y confirma
- **THEN** la iniciativa pasa a "Activa", la card de activas y el FTE demandado la incluyen, y el sistema confirma con un toast

#### Scenario: Cerrar una iniciativa activa
- **WHEN** el Chapter Lead cierra una iniciativa activa y confirma
- **THEN** la iniciativa pasa a "Cerrada" y deja de contar en el FTE demandado
