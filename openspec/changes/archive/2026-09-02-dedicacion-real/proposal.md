## Why

El módulo Backlog nació como una **cola de triage**: el Chapter Lead clasificaba historia por historia como iniciativa, BAU o nada, y con eso se pretendía construir el "FTE real". Ese trabajo manual ya no tiene razón de ser —las historias de usuario llegan de Azure DevOps con una etiqueta que dice si son iniciativa o BAU— y la pregunta que el Líder de Expertise hace cada sprint es otra: **¿cómo está la dedicación de cada una de mis capacidades?** Cuánto comprometió esta persona en el sprint frente a lo que le asigné en su célula, en qué lo está gastando (iniciativa o BAU), y si está entregando (commits, releases, features creadas). Con eso decide si tiene candidatas para reforzar otra iniciativa, si a alguien hay que bajarle carga para poder subírsela a otra persona, o si un caso merece revisarse.

La plataforma ya tiene las tres piezas que hacen posible esa lectura: la dedicación declarada en la asignación a la célula, la identidad de Azure DevOps vinculada a cada persona (con el identificador del usuario para consultar su trabajo), y las iniciativas activas por célula. Lo que falta es el módulo que las junta contra la realidad de DevOps, sprint a sprint, y la deja leer de un vistazo.

## What Changes

- **Backlog se retira y en su lugar nace *Dedicación real*** (entrada de navegación "Dedicación", ruta `/app/lead/dedicacion`, capability `real-dedication`): el nombre dice lo que la pantalla responde —cuánta dedicación real tiene cada capacidad frente a la asignada— y hace pareja con el indicador *Asignado* de la ficha. La pantalla lista las capacidades a cargo del Líder de Expertise —las personas de su chapter— con, para el sprint en curso y en un solo lenguaje —FTE, sobre una sola barra—: el FTE comprometido (los puntos de sus historias traducidos a FTE: 26 puntos = 1.0 FTE) frente al FTE asignado en su célula, cuánto de ese compromiso va a iniciativa y cuánto a BAU, y la **lectura** reducida a un icono (flecha arriba = por encima, flecha abajo = por debajo, verificación = en línea, guion = sin célula, icono de DevOps apagado = sin identidad) con el detalle en el tooltip. La actividad no va en el listado: se lee por capacidad. Se filtra por célula y lectura, se busca por nombre, y ordena primero a quien más se aleja de lo asignado.
- **Cada capacidad tiene su dedicación real por sprint** en `/app/lead/dedicacion/:personId`: los sprints que Azure DevOps devuelve para esa persona, la comparación FTE comprometido vs FTE asignado del sprint elegido, la dedicación sprint a sprint (la misma barra por sprint: iniciativa y BAU apilados sobre la banda de lo asignado), las historias del sprint con su etiqueta y puntos, y un **mapa de actividad** del sprint: una celda por día con la intensidad de lo que la persona hizo en Azure DevOps —commits, releases y features creadas—, con los totales por tipo. Desde ahí se reasigna con el mismo drawer de la Torre.
- **Actualizar desde Azure DevOps**: una acción para actualizar todas las capacidades o una sola, usando el identificador del usuario de DevOps que dejó la vinculación; la pantalla muestra cuándo fue la última actualización.
- **La clasificación llega de Azure.** Iniciativa / BAU se leen de la etiqueta de cada historia; lo que no trae etiqueta cuenta en lo comprometido y se señala como "sin etiqueta". Desaparecen la cola de triage, clasificar, saltar, deshacer, rechazar y la curación manual.
- **Nuevo parámetro del Calendario de sprints**: *Puntos por FTE por sprint* (26 por defecto), la tasa con la que el Backlog traduce puntos de historia a FTE. El FTE comprometido de una persona es sus puntos del sprint divididos por ese valor.
- **La ficha de la persona** reemplaza el indicador *Backlog en DevOps* por *Dedicación real*: en lugar de items activos y pendientes de curación muestra la barra única con la lectura del sprint en curso y enlaza a la dedicación real de esa capacidad.
- **La navegación**: la entrada "Dedicación" ocupa el lugar de Backlog y muestra como badge cuántas capacidades están fuera de lo asignado (por encima o por debajo) en el sprint en curso; `/app/lead/backlog` redirige.
- **BREAKING** (contrato del mock, no de producción): desaparecen los endpoints de la cola de triage (`GET /backlog/queue`, catálogos, clasificar, saltar, deshacer, rechazar) y la identidad DevOps del detalle deja de traer `activeItems`, `initiativeItems`, `bauItems` y `pendingCuration`.

### Fuera de alcance

- Heredar en la asignación la dedicación sugerida por la evaluación de la iniciativa (change aparte). Este módulo compara contra la dedicación que hoy está declarada en la asignación.
- Escribir en Azure DevOps (reasignar historias, cambiar etiquetas): la integración es solo lectura.
- El backend .NET: los contratos quedan escritos y servidos por el mock.
- Pantallas para Colaborador o Líder Técnico.

## Capabilities

### New Capabilities

- `real-dedication`: **Dedicación real de las capacidades**, **Dedicación real de una capacidad por sprint**, **Lectura de dedicación real frente a la asignada** y **Sincronización con Azure DevOps**.

### Modified Capabilities

- `backlog`: se retira entera —**Cola de triage del backlog**, **Clasificar, saltar y deshacer** y **Rechazar una historia con motivo**—; al archivar, su spec principal desaparece.
- `api-mocking`: se retira **Handler de mock para el backlog** y se agrega **Handler de mock para la dedicación real**; **Handler de mock para la configuración de sprints** gana los puntos por FTE por sprint; **Handler de mock para el detalle de una persona** cambia lo que viaja en la identidad DevOps.
- `admin-shell`: **Pantallas placeholder de Admin** describe el Calendario de sprints con tres campos.
- `people`: **Detalle de persona** reemplaza el indicador *Backlog en DevOps* por *Dedicación real*.
- `chapter-lead-shell`: **Navegación lateral del rol Chapter Lead** cambia la entrada Backlog por Dedicación y qué cuenta su badge.

## Impact

- **Contrato de API** — nuevos `GET /dedication/capacities` (filtros `squadId`, `reading`, `search`), `GET /dedication/capacities/{personId}?sprint=`, `POST /dedication/capacities/sync` y `POST /dedication/capacities/{personId}/sync`; `GET/PUT /admin/sprint-config` gana `pointsPerFtePerSprint`. Es un acuerdo con quien implemente el backend; en frontend lo sirve el mock a partir de las identidades vinculadas, las asignaciones y las iniciativas activas en memoria.
- **Frontend** — `features/backlog` se borra y nace `features/dedication` (contenedores, componentes, hooks, servicio, adapter, pruebas); `features/admin-shell` y `pages/AdminSprintsPage` (parámetro nuevo); `features/people` (indicador y mock del detalle); `layouts/ChapterLeadLayout` y `features/chapter-lead-shell` (badge y título de ruta); `app/router` (rutas nuevas y redirección de `backlog`); `mocks/handlers/dedication.*` en lugar de `backlog.*` (semillas nuevas: sprints por persona, historias etiquetadas con puntos, actividad por día).
- **Lo que cambia de significado** — "Backlog" desaparece del vocabulario y entra "Dedicación real"; "pendiente de curación" desaparece del vocabulario; "FTE comprometido" y "lectura" entran: el backlog se lee en la misma unidad que la asignación.
- **Diseño** — se aplica la skill *impeccable* en modo Operate sobre el sistema de diseño tuip: dos pantallas nuevas y sus estados, con lienzo hi-fi para revisar antes de implementar (referenciado en design.md). Se escribe `PRODUCT.md` con la verdad del producto, que la skill exige como precondición.
- **Docs** — el doc de roles nombra la pantalla de Backlog como cola de triage y curación; se actualiza a Dedicación real.
