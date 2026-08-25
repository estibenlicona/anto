## Why

El Chapter Lead necesita saber qué tecnologías domina cada persona (.NET, React, React Native, Azure, Bus de Integración, MuleSoft, AS400, Kafka…) y con qué nivel: es lo que decide a quién asignar a una célula y dónde el chapter depende de una sola persona (RN-38: una persona cubre varias capacidades; mapa de conocimientos y bus factor de los MVP v2/v5). Hoy el detalle de persona muestra "Capacidades que cubre" desde datos de ejemplo y nada de eso se puede ver en el listado ni editar.

Se implementa el diseño "Stacks de Personas" **adaptado a lo que tuip ofrece hoy**, sin piezas nuevas: los chips de stack son `Tag`; el filtro es `FilterButton`; el nivel por stack reutiliza `SeniorityCard` y `SegmentedControl`; el alta en el drawer es `Combobox` múltiple; los compañeros que cubren un stack, `AvatarGroup`. Donde el canvas dibujaba otra cosa, manda el componente.

## What Changes

- **Modelo**: cada persona tiene una lista de **stacks** del catálogo del chapter, cada uno con un **nivel** en la misma escala Tuya del seniority (Principiante · Competente · Avanzado · Experto) y uno marcado como **principal**. Mock‑first: el mock de personas guarda `stacks` por persona; catálogo `GET /people/stacks`; edición `PUT /people/:id/stacks`.
- **Listado de Personas**: columna **Stacks** — `Tag`s en gris, el principal primero, hasta tres y "+N"; filtro **Stack** con `FilterButton` (multi‑selección, combinable con búsqueda y seniority; vuelve a la primera página). La columna **Rol** se retira del listado: en los datos actuales repite a Cargo y el ancho hace falta para Stacks (Rol sigue en el formulario y en el detalle).
- **Resumen de Personas**: la card de FTE disponible se reemplaza por **Cobertura por stack**: cuántos stacks cubre el chapter y cuáles dependen de una sola persona (`Badge` de riesgo), calculado sobre todas las personas.
- **Detalle de persona**: el panel "Capacidades que cubre" pasa a ser **Stacks**: por stack, nivel con `SeniorityCard` (medidor), `AvatarGroup` con quiénes más lo cubren y cuántos, `Badge` "Principal" y `Badge` de peligro "Bus factor 1" cuando nadie más; el enlace **Editar** abre el drawer. El encabezado no cambia.
- **Drawer "Stacks de <nombre>"**: `Combobox` múltiple sobre el catálogo para agregar; lista de los stacks de la persona con `SegmentedControl` de nivel por fila, `Select` "Stack principal" y quitar por fila (`Button` subtle con ícono); aviso cuando al quitar un stack nadie más lo cubre; **Guardar** como único primario. Sin "proponer stack nuevo" (el catálogo lo administra el mock por ahora).
- **Torre / Backlog** no cambian; la sugerencia de células para una persona sin célula (detalle) sigue por cargo.

### Fuera de alcance

- Mapa de stacks (stack × personas) como pantalla propia.
- Alta de stacks nuevos al catálogo desde la UI ("Otro…" del canvas).
- Stacks en el formulario de crear/editar persona: se editan desde el detalle.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `people`: "Resumen del módulo de Personas" (card Cobertura por stack en lugar de FTE disponible), "Listar personas" (columna Stacks, filtro por stack, sin columna Rol), "Detalle de persona" (panel Stacks con edición), y requirement nuevo "Editar los stacks de una persona".
- `api-mocking`: "Handler de mock para personas" gana stacks por persona, catálogo y `PUT` de stacks; el resumen agrega la cobertura por stack; "Handler de mock para el detalle de una persona" deriva las capacidades de los stacks de la persona.

## Impact

- Frontend: `features/people/{services/personService.ts, adapters/PersonAdapter.ts, components/PeopleList.tsx, components/PeopleStatsCards.tsx, PeopleContainer.tsx, hooks/usePeople.ts, hooks/usePersonStacks.ts (nuevo), components/detail/PersonCapabilitiesPanel.tsx → PersonStacksPanel.tsx, components/detail/EditStacksDrawer.tsx (nuevo), PersonDetailContainer.tsx}`; `PersonDetailAdapter` (capabilities ← stacks).
- Mocks: `people.handlers.ts` (stacks por persona, catálogo, `PUT`, cobertura en el resumen), `personDetail.handlers.ts` / `personDetail.seeds.ts` (capacidades derivadas; se retira `CAPABILITIES_BY_PERSON`), `backlog.seeds.ts` sin cambios.
- Specs de `people` y `api-mocking`; tests de listado, stats, detalle y handlers.
- tuip: sin cambios. Brechas detectadas al implementar:
  - `Tag` no admite un énfasis "principal": en el listado se resuelve con el orden (principal primero); en el drawer, con un texto "Principal" junto al nombre.
  - `Combobox` múltiple dibuja sus propios chips con "Quitar X", duplicando la acción de quitar de cada fila de la lista (y su nombre accesible). Un `Combobox` con `hideSelection` (sólo agregar, sin chips) evitaría mostrar dos veces la misma selección.
  - `SegmentedControl` no tiene densidad compacta: cuatro opciones por fila ocupan casi la mitad del ancho del drawer; hubo que abreviar las etiquetas (Princ./Comp./Avanz./Exp.).
  - La hoja de tuip sigue emitiendo `.grid-cols-1` después de la del app (misma capa `utilities`), lo que pisa `sm:/lg:grid-cols-*`: se quitó `grid-cols-1` del grid de `PeopleStatsCards` (ya anotado en add-backlog-triage).
  - `Badge` no admite icono ni contador: la card de cobertura lista un Badge warning por stack en riesgo; con más de ~6 sería necesario resumir ("+N").
