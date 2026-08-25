## Purpose

La capacidad `backlog` es la cola de triage del chapter: el Chapter Lead decide, una historia a la vez, si el trabajo que llega de los tableros DevOps es iniciativa, BAU o nada, y con eso confirma que cada historia es de quien DevOps dice. Sólo lo clasificado cuenta como FTE real.

## ADDED Requirements

### Requirement: Cola de triage del backlog
El sistema SHALL exponer la pantalla Backlog en `/app/lead/backlog`, con breadcrumb `Plataforma / Gestionar Backlog`, organizada como una cola de triage: a la izquierda la lista de historias y a la derecha la historia en curso. El encabezado SHALL mostrar el progreso del día: cuántas historias se clasificaron hoy y cuántas quedan sobre el total, con una barra de progreso.

La **cola** SHALL listar las historias de usuario pendientes de clasificar, una fila por historia con su posición, título, número, célula y persona asignada (avatar); SHALL ordenarse con las que volvieron a curación por cambio de asignado primero y luego por fecha de ingesta; SHALL resaltar la historia en curso; SHALL marcar en rol de advertencia las filas cuyo asignado cambió desde la última clasificación, indicando quién era antes; SHALL filtrarse por célula con chips seleccionables que muestran el conteo de cada una y "Todas"; SHALL alternar entre *Por clasificar* y *Clasificadas*; y SHALL indicar al pie cuántas historias quedan fuera de la cola por pertenecer a personas sin identidad DevOps vinculada, con un enlace para vincularlas. Con `?persona=<id>` en la URL, la cola SHALL abrirse filtrada por esa persona. Sin historias pendientes, la cola SHALL mostrar un estado vacío que lo diga.

La **historia en curso** SHALL mostrarse en tres zonas separadas: *qué es* (Epic al que pertenece y tipo, número, título, descripción, puntos, estado en DevOps, tablero, sprint, posición en la cola, fecha de ingesta y enlace para abrirla en DevOps); *de quién es* (avatar, nombre, cargo, célula, usuario DevOps y si la identidad está vinculada; y la acción secundaria "No es de <nombre>…"); y *la decisión*: tres tarjetas de opción mutuamente excluyentes — **Iniciativa** (con un selector de las iniciativas activas de la célula de la persona, preseleccionando la sugerida cuando el Epic de la historia está mapeado a una), **BAU** (con un selector de las categorías BAU del catálogo) y **Descartar** — cada una con su atajo visible (`1`, `2`, `3`). Ninguna tarjeta SHALL vestir el color de marca al elegirse.

El pie de la historia SHALL mostrar los atajos (`1`/`2`/`3` elegir, `↵` guardar y seguir, `S` saltar) y dos acciones: **Saltar por ahora** (secundaria) y **Guardar y siguiente** (la única acción primaria de la pantalla). Los atajos SHALL funcionar cuando el foco no está en un campo de texto.

#### Scenario: Abrir la cola
- **WHEN** el Chapter Lead entra a Backlog con historias pendientes
- **THEN** ve el progreso del día, la cola con las pendientes (las que cambiaron de asignado primero), la primera resaltada y cargada a la derecha con sus tres zonas, y la entrada "Backlog" activa en la navegación

#### Scenario: Filtrar por célula y por persona
- **WHEN** el Chapter Lead enciende el chip de una célula, o llega con `?persona=<id>`
- **THEN** la cola y el progreso se limitan a esa célula o persona, la primera historia del subconjunto queda en curso, y el chip muestra cuántas historias quedan en ella

#### Scenario: Iniciativa sugerida
- **WHEN** la historia en curso pertenece a un Epic mapeado a una iniciativa activa
- **THEN** la tarjeta Iniciativa aparece elegida con esa iniciativa ya seleccionada y la leyenda de que es la sugerida por el mapeo

#### Scenario: Historia que cambió de asignado
- **WHEN** una historia volvió a la cola porque su asignado cambió en DevOps
- **THEN** su fila en la cola y la zona "de quién es" lo dicen en rol de advertencia, nombrando al asignado anterior, sin bloquear la clasificación

#### Scenario: Historias excluidas por identidad
- **WHEN** existen historias asignadas en DevOps a usuarios sin persona vinculada
- **THEN** no entran a la cola y el pie de la cola dice cuántas son, con un enlace a vincular identidades

#### Scenario: Cola vacía
- **WHEN** no quedan historias por clasificar en el filtro actual
- **THEN** la cola muestra un estado vacío y la zona de la derecha invita a ver las clasificadas o a quitar el filtro

### Requirement: Clasificar, saltar y deshacer
Al **guardar**, el sistema SHALL registrar la clasificación elegida (iniciativa con su iniciativa, BAU con su categoría, o descartada), SHALL confirmar que la historia es de la persona asignada en DevOps, SHALL sacar la historia de *Por clasificar*, SHALL sumar una al progreso del día y SHALL pasar a la siguiente historia de la cola sin que el Chapter Lead tenga que elegirla. Guardar sin una opción elegida, o con Iniciativa/BAU sin su selector completo, SHALL marcar lo que falta y no guardar. **Saltar** SHALL mover la historia al final de la cola y cargar la siguiente, sin registrar nada. En *Clasificadas*, cada historia SHALL mostrar su clasificación y una acción **deshacer** que la devuelve a *Por clasificar* con su clasificación anterior borrada: la clasificación es reversible. El atajo `↵` SHALL equivaler a Guardar y siguiente, `S` a Saltar y `1`/`2`/`3` a elegir la tarjeta.

#### Scenario: Guardar y seguir
- **WHEN** el Chapter Lead elige Iniciativa con "Kafka Migration" y guarda
- **THEN** la historia queda clasificada como iniciativa de Kafka Migration y confirmada a su persona, desaparece de Por clasificar, el progreso suma una, y la siguiente historia queda en curso

#### Scenario: Guardar incompleto
- **WHEN** el Chapter Lead guarda con BAU elegido pero sin categoría, o sin elegir tarjeta
- **THEN** el sistema señala la tarjeta o el selector que falta y no guarda ni avanza

#### Scenario: Saltar
- **WHEN** el Chapter Lead salta una historia
- **THEN** pasa al final de la cola sin clasificación y la siguiente queda en curso

#### Scenario: Deshacer
- **WHEN** en Clasificadas el Chapter Lead deshace una historia
- **THEN** vuelve a Por clasificar sin clasificación y el progreso del día resta una si se había clasificado hoy

#### Scenario: Atajos de teclado
- **WHEN** el foco no está en un campo de texto y el Chapter Lead pulsa `2` y luego `↵`
- **THEN** la tarjeta BAU queda elegida y, si tiene categoría, la historia se guarda y la cola avanza; `S` la salta

### Requirement: Rechazar una historia con motivo
La acción "No es de <nombre>…" SHALL abrir un drawer con: el item (número, título, tipo, puntos, tablero, clasificación si la tiene, a quién está asignado en DevOps y, si aplica, quién era el asignado anterior); el **motivo**, obligatorio, elegido entre *Es de otra persona*, *Error de asignación en DevOps*, *Duplicado*, *Trabajo de otro equipo* y *Otro*; "¿De quién es, entonces?", opcional, con las personas del chapter; un detalle opcional de texto libre; y "Así queda" con el efecto en la persona actual y, si se indicó, en la nueva. **Rechazar** SHALL ser la acción primaria del drawer. Al confirmar, la historia SHALL salir de la cola y dejar de contar para la persona, el rechazo SHALL quedar trazado con su motivo y, si se indicó otra persona, la historia SHALL entrar a la cola a nombre de ella como pendiente. DevOps NO SHALL modificarse. Sin motivo, Rechazar SHALL señalar el campo y no aplicar.

#### Scenario: Rechazar y reasignar
- **WHEN** el Chapter Lead rechaza con motivo "Es de otra persona" e indica a Julián Peña
- **THEN** la historia deja de contar para Carlos, queda rechazada con ese motivo, y aparece en la cola a nombre de Julián como pendiente; la cola avanza a la siguiente

#### Scenario: Rechazar sin motivo
- **WHEN** el Chapter Lead confirma Rechazar sin elegir motivo
- **THEN** el drawer señala el motivo como obligatorio y no aplica nada

#### Scenario: Rechazo trazado
- **WHEN** una historia fue rechazada
- **THEN** en Clasificadas aparece como rechazada con su motivo y sin contar para nadie
