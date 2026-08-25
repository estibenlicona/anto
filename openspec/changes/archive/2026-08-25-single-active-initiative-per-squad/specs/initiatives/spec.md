## MODIFIED Requirements

### Requirement: Cambiar el estado de una iniciativa
El sistema SHALL permitir **Activar** una iniciativa sólo si tiene talla (evaluación guardada) **y su célula no tiene ya una iniciativa activa**, y **Cerrar** sólo si está activa. Una célula SHALL sostener como mucho una iniciativa activa a la vez: activar una segunda SHALL rechazarse con un mensaje que nombre la condición y diga qué hacer (cerrar la activa antes), en español y sin cerrar la confirmación. La regla es del dominio, no de la pantalla: el servidor SHALL rechazarla aunque la interfaz no lo haya impedido.

Las acciones no disponibles SHALL mostrarse deshabilitadas en el menú de la fila, con el mismo tratamiento con que hoy se deshabilita "Activar" sin talla: el menú NO SHALL explicar el motivo. Activar SHALL pedir confirmación indicando que la iniciativa pasará a contar como demanda; cerrar SHALL pedir confirmación.

Cuántas iniciativas **en evaluación** tiene una célula NO SHALL estar limitado: la regla alcanza sólo al estado Activa.

#### Scenario: Activar sin talla
- **WHEN** el Chapter Lead abre el menú de una iniciativa sin evaluación guardada
- **THEN** "Activar" está deshabilitado

#### Scenario: Activar con la célula ya ocupada
- **WHEN** el Chapter Lead abre el menú de una iniciativa evaluada cuya célula ya tiene otra iniciativa activa
- **THEN** "Activar" está deshabilitado, igual que lo está para una iniciativa sin evaluar

#### Scenario: El servidor rechaza la segunda activación
- **WHEN** llega una petición de activar una iniciativa en una célula que ya tiene una activa
- **THEN** el sistema la rechaza sin cambiar ningún estado, y la pantalla muestra el motivo en español dentro de la confirmación, que sigue abierta

#### Scenario: Varias iniciativas en evaluación en la misma célula
- **WHEN** una célula tiene dos iniciativas en evaluación y ninguna activa
- **THEN** ambas se pueden evaluar y activar mientras la célula siga sin activa; activar una deja a la otra sin poder activarse hasta que la primera se cierre

#### Scenario: Activar una iniciativa evaluada
- **WHEN** el Chapter Lead activa una iniciativa con talla y confirma
- **THEN** la iniciativa pasa a "Activa", la card de activas y el FTE demandado la incluyen, y el sistema confirma con un toast

#### Scenario: Cerrar una iniciativa activa
- **WHEN** el Chapter Lead cierra una iniciativa activa y confirma
- **THEN** la iniciativa pasa a "Cerrada" y deja de contar en el FTE demandado

