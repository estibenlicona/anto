## ADDED Requirements

### Requirement: Handler de mock para el backlog
El sistema SHALL exponer un handler de mock del backlog con: un `GET` de la cola que devuelve las historias de usuario del chapter (número, título, descripción, tipo, puntos, estado en DevOps, tablero, sprint, Epic y su iniciativa mapeada si la hay, usuario DevOps asignado y el anterior si cambió, fecha de ingesta, estado de triage `Pending | Classified | Rejected`, clasificación con iniciativa o categoría, fecha de clasificación, motivo de rechazo) junto con un resumen (total, pendientes, clasificadas hoy, pendientes por célula, historias excluidas por usuarios DevOps sin persona) y que acepta filtros por célula, persona y estado; un `GET` de catálogos (iniciativas activas por célula, categorías BAU, motivos de rechazo); y cuatro `POST` por historia: clasificar (`kind` iniciativa | BAU | descartar con su iniciativa o categoría; 400 si falta lo que el tipo exige), saltar (la manda al final del orden), deshacer (vuelve a `Pending` sin clasificación; 409 si no estaba clasificada) y rechazar (`reason` obligatorio, `reassignToPersonId` y `detail` opcionales; 400 sin motivo). Todo SHALL persistir en memoria durante la sesión, disponible en Node y en navegador, con `reset`.

La persona y la célula de cada historia SHALL derivarse de las identidades DevOps del mock de detalle de persona y de los snapshots de personas y asignaciones: una historia cuyo usuario DevOps no está vinculado a ninguna persona NO SHALL entrar a la cola y SHALL contarse como excluida; vincular esa identidad en la misma sesión SHALL hacerla aparecer en el siguiente `GET`. Rechazar con `reassignToPersonId` SHALL crear la historia como pendiente a nombre de esa persona y dejar la original como rechazada y trazada.

#### Scenario: Cola con resumen
- **WHEN** se hace un `GET` de la cola sin filtros
- **THEN** responde con las historias pendientes ordenadas (cambio de asignado primero, luego por ingesta), el resumen coherente con ellas (pendientes por célula suman el total de pendientes) y la cuenta de excluidas por identidad

#### Scenario: Clasificar y avanzar
- **WHEN** se hace un `POST` de clasificar como iniciativa con un `initiativeId` válido
- **THEN** responde `200`, la historia pasa a `Classified` con esa iniciativa y fecha de hoy, y el siguiente `GET` la excluye de las pendientes y suma una a clasificadas hoy; clasificar como BAU sin categoría responde `400`

#### Scenario: Saltar, deshacer y rechazar
- **WHEN** se salta una historia, luego se deshace una clasificada y se rechaza otra con motivo y nueva persona
- **THEN** la saltada queda última en el orden; la deshecha vuelve a `Pending` sin clasificación; la rechazada queda `Rejected` con su motivo y aparece una historia nueva pendiente a nombre de la persona indicada; rechazar sin motivo responde `400` y deshacer una pendiente responde `409`

#### Scenario: Historias sin persona
- **WHEN** una historia está asignada a un usuario DevOps sin persona vinculada
- **THEN** no aparece en la cola y el resumen la cuenta como excluida; tras vincular esa identidad con el handler de detalle de persona, el siguiente `GET` la incluye
