## Why

La vista de backlog (`/app/lead/backlog`) abre con un encabezado de módulo —título "Backlog" y una línea de descripción— que repite lo que el shell ya dice: el breadcrumb muestra "Gestionar Backlog" y la entrada del menú lateral queda activa. Ese bloque, más un `gap-5` entre encabezado y cuerpo y un `gap-4` entre la cola y el panel de la historia, empuja hacia abajo justo el contenido con el que se trabaja (la cola y la historia en curso). Células, personas y ausencias ya pasaron por esta misma compactación; backlog es la única pantalla de trabajo del chapter lead que conserva encabezado propio y mezcla medidas de separación.

## What Changes

- Se retira el encabezado visible del módulo (título "Backlog" y la descripción "Una historia a la vez: decidí si es iniciativa, BAU o nada…"). La cola y el panel de la historia en curso pasan a ser lo primero que se ve en el contenido.
- El resumen del día ("N clasificadas hoy · quedan M de T") sube a la franja del breadcrumb del shell, alineado a la derecha y a la misma altura que el breadcrumb, con el mecanismo `useLeadBreadcrumbActions` que ya usan células, personas y ausencias. Se publica sólo cuando hay resumen cargado; mientras el backlog carga por primera vez la franja muestra sólo el breadcrumb.
- La barra de progreso "Progreso del día" sube junto con el texto, pero estrecha y en la misma línea, a la derecha del texto: hoy es un bloque de 20rem apilado bajo el texto, y la franja del breadcrumb es una banda de una sola línea. Decisión del usuario al revisar la propuesta (se había planteado retirarla).
- La página gana un `h1` `sr-only` "Gestionar Backlog" —hoy `LeadBacklogPage` no envuelve nada y el único `h1` es el visible del encabezado—, siguiendo el patrón de `LeadPeoplePage` y `LeadAbsencesPage`.
- Toda la separación entre bloques de la vista pasa a una sola medida de 12px (`gap-3`): la vertical del contenedor (hoy `gap-5`, 20px) y la horizontal entre la cola y el panel de la historia en curso (hoy `gap-4`, 16px). El interior de cada card (paddings y gaps propios de la cola, del panel y de las cards de decisión) no cambia: son medidas internas del componente, no separación entre bloques de la pantalla.

## Capabilities

### New Capabilities
- `backlog-triage-view`: disposición de la vista de clasificación del backlog — qué bloques la componen y en qué orden, dónde vive el resumen del día, cómo se mantiene el encabezado accesible sin título visible y qué medida única de separación usa.

### Modified Capabilities
<!-- Ninguna. `lead-shell-page-actions` ya describe la franja del breadcrumb y no
     cambia: esta vista sólo la usa, publicando un texto de resumen en vez de un
     botón, que es algo que la spec ya admite ("las acciones que la pantalla
     active publique" es cualquier nodo). -->

## Impact

- `src/features/backlog/BacklogContainer.tsx`: deja de montar `BacklogHeader`; publica el resumen del día con `useLeadBreadcrumbActions`; `gap-5` → `gap-3` en la raíz y `gap-4` → `gap-3` en el grid cola/panel.
- `src/features/backlog/components/BacklogHeader.tsx`: se elimina; el resumen (texto y barra estrecha en línea) se conserva como componente propio y pequeño (`BacklogDaySummary` o equivalente), sin título ni descripción, para poder publicarlo y probarlo aislado.
- `src/pages/LeadBacklogPage/LeadBacklogPage.tsx`: pasa de un one-liner a un `div` con `h1` `sr-only` "Gestionar Backlog" más el contenedor.
- Tests: `BacklogContainer.test.tsx` usa `findByText(/clasificadas hoy/)` como centinela de carga en casi todos sus casos; como ese texto pasa a vivir en lo publicado, el render necesita `LeadBreadcrumbProvider` y una sonda que pinte `actions` (mismo patrón que `PeopleContainer.test.tsx` y `AbsencesContainer.test.tsx`). `BacklogComponents.test.tsx` cambia el `describe("BacklogHeader")` por el del nuevo componente, conservando los asserts del texto y del `progressbar`. Nuevo `LeadBacklogPage.test.tsx`.
- No se toca el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`), ni `BacklogQueue`, `CurrentStoryPanel`, `DecisionCards`, `RejectItemDrawer`, los hooks, el servicio, el adaptador ni el contrato con el backend. Los atajos de teclado y el filtro `?persona=` siguen igual.
- Fuera de alcance: el interior de las cards de la cola y del panel, el resto de pantallas del lead y cualquier cambio en el flujo de clasificar/saltar/rechazar/deshacer.
