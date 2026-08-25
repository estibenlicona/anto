## Why

El FTE real del chapter se construye con dos datos que hoy no existen en la app: las horas reportadas y los work items que llegan de los tableros DevOps. El segundo necesita que el Chapter Lead decida, historia por historia, **qué es el trabajo** (iniciativa, BAU o nada — RN-57) y, de paso, confirme **de quién es** (RN-51/52). Hoy no hay dónde hacerlo: el detalle de persona muestra "N pendientes de curación" con un enlace a una bandeja que no existe. El diseño aprobado ("Backlog y Curación", versión cola de triage) resuelve la tarea como un trabajo largo y repetitivo: una historia a la vez, tres opciones grandes, un solo primario, atajos de teclado.

Mock-first, como el resto: los work items, las iniciativas activas por célula y las categorías BAU entran como mocks nuevos. Las cuatro piezas de `tuip` que el diseño necesitaba (`OptionCard`, `Textarea`, `Kbd`, `Chip` seleccionable) ya están publicadas en el `.tgz` local (`add-triage-primitives`).

## What Changes

- **Entrada "Backlog"** en el grupo Capacidad de la navegación del Chapter Lead, con el contador de historias por clasificar como badge; ruta `/app/lead/backlog`; breadcrumb `Plataforma / Gestionar Backlog`.
- **Pantalla Backlog (cola de triage)**: encabezado con el progreso del día ("N clasificadas hoy · quedan M de T"); a la izquierda la **cola** (filtros por célula como `Chip` seleccionables con contador, alternancia *Por clasificar / Clasificadas*, la historia en curso resaltada, aviso en ámbar cuando cambió el asignado — RN-54, pie con cuántas historias quedan fuera por personas sin identidad DevOps — RN-23); a la derecha la **historia en curso** en tres zonas: *qué es* (Epic › tipo, #id, título, descripción, puntos, estado, tablero, sprint, enlace a DevOps), *de quién es* (persona, cargo, célula, identidad vinculada; acción secundaria "No es de <nombre>…"), y *la decisión*: `OptionCardGroup` con **Iniciativa** (Select de iniciativas activas de la célula, con la sugerida por el mapeo del Epic), **BAU** (Select de las 9 categorías) y **Descartar**; pie con atajos (`1/2/3`, `↵`, `S`) y un único primario **Guardar y siguiente** junto a *Saltar por ahora*.
- **Guardar** clasifica la historia y confirma que es de quien DevOps dice (RN-52); la cola avanza a la siguiente. **Saltar** la manda al final de la cola. En *Clasificadas*, cada historia muestra su clasificación y permite **deshacer** (vuelve a *Por clasificar*; la clasificación es reversible — RN-57).
- **Drawer "No es de <nombre>"** (rechazo): el item, motivo obligatorio como `SegmentedControl`/pills (Es de otra persona · Error de asignación en DevOps · Duplicado · Trabajo de otro equipo · Otro), "¿De quién es, entonces?" opcional (Select de personas del chapter), detalle opcional (`Textarea`), "Así queda", y **Rechazar** como primario del drawer. Rechazar saca la historia de la cola, queda trazada (RN-53) y, si se indicó otra persona, entra a la cola a nombre de ella; DevOps no se toca (RN-47).
- **Mocks nuevos** (capacidad `api-mocking`): `GET /backlog/queue` (cola + resumen + filtros), `POST /backlog/items/:id/classify`, `POST /backlog/items/:id/skip`, `POST /backlog/items/:id/undo`, `POST /backlog/items/:id/reject`; `GET /backlog/catalogs` (iniciativas activas por célula, categorías BAU, motivos de rechazo). Derivan persona/célula de los snapshots de personas y asignaciones, y reutilizan las identidades DevOps del mock de detalle de persona (una persona sin identidad no aporta historias a la cola).
- **Detalle de persona**: el enlace "Ir a la bandeja" pasa a `/app/lead/backlog?persona=<id>` (la cola filtrada por esa persona).
- Actualizar la dependencia `@tuya-ui/components` al `.tgz` con las primitivas de triage.

### Fuera de alcance

- Mapeo Epic/Feature ↔ Iniciativa (RN-49/55) y el Squad Board: pantallas propias, pendientes de diseño.
- Backlog por célula como tab del detalle de célula: la cola filtrada por célula lo cubre.
- Ingesta real de DevOps, identidades y vinculación (ya en el detalle de persona).

## Capabilities

### New Capabilities
- `backlog`: la cola de triage del chapter — clasificar historias (iniciativa / BAU / descartar), saltar, deshacer y rechazar con motivo; filtros, progreso y exclusiones.

### Modified Capabilities
- `chapter-lead-shell`: "Navegación lateral del rol Chapter Lead" suma la entrada "Backlog" con badge de pendientes.
- `api-mocking`: nuevo requirement "Handler de mock para el backlog".
- `people`: en "Detalle de persona", el enlace a la bandeja de curación apunta a la cola filtrada por esa persona.

## Impact

- Frontend: `src/features/backlog/` (services, adapters, hooks, components, `BacklogContainer`), `src/pages/LeadBacklogPage/`, `routes.tsx`, `chapter-lead-shell/navigation.ts` + `ChapterLeadLayout` (badge), `people/components/detail/PersonDetailStatsCards.tsx` (enlace).
- Mocks: `src/mocks/handlers/backlog.handlers.ts` + `backlog.seeds.ts`, registrados en `index.ts`; reutiliza `personDetail.handlers` (identidades) vía snapshot.
- Dependencia: `@tuya-ui/components` reinstalada desde `tuip/.local-packages` (trae `OptionCard`, `Textarea`, `Kbd`, `Chip selectable`).
- Brecha detectada al implementar (para un change en tuip): el CSS del paquete se importa después del de la app y comparte la capa `utilities`, así que cualquier utilidad genérica que un componente de tuip use (p. ej. `grid-cols-1` en `OptionCardGroup`) se emite *después* de las de la app y pisa sus variantes responsivas (`lg:grid-cols-[…]`) cuando conviven con la misma utilidad base. Mitigado en la app quitando el `grid-cols-1` redundante de los cuatro contenedores responsivos (Backlog, Torre, detalle de persona, Sprints de Admin). Solución de fondo en tuip: emitir sus utilidades en una capa propia (`@layer tuip`) o publicar el CSS con sus utilidades bajo el prefijo/capa de la librería.
