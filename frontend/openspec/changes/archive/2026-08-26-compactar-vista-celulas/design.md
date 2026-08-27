## Context

Hoy `SquadsContainer` apila tres bloques con `gap-6`: `SquadsHeader` (h1 + descripción + botón "Nueva célula"), `SquadsStatsCards` y `SquadsList`. `LeadSquadsPage` no pone `h1` propio porque el del encabezado ya es el visible.

El shell del chapter lead (`ChapterLeadLayout`) pinta la franja del breadcrumb como un `div` propio (`bg-neutral-canvas px-6 py-3`) encima de `<main>`; no es parte de `AppShell` de tuip, así que el frontend puede cambiar su disposición sin tocar la librería. Ya existe `LeadBreadcrumbContext` con el patrón "la pantalla publica, el layout lee": `useLeadBreadcrumbTrailing(label)` publica el último nivel del breadcrumb mientras el componente está montado y lo limpia al desmontar; fuera del provider el hook es un no-op para que las pantallas no dependan del layout en tests. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para el contenido, sin perder la acción de crear ni el encabezado accesible.
- Que el botón quede a la altura del breadcrumb, a la derecha, con el mismo mecanismo que ya usa el shell para el breadcrumb.
- Una sola regla de espaciado vertical (`gap-4`) en la columna de contenido.

**Non-Goals:**
- Tocar `SquadsList`, el detalle de célula ni las cards.
- Replicar el cambio en Personas u otros módulos (se evalúa aparte; el mecanismo queda listo).
- Mover la franja del breadcrumb a `AppShell` de tuip o crear ahí un slot de acciones.
- Un "page header" genérico con título; el título sigue siendo cosa del breadcrumb.

## Decisions

**1. Publicar acciones por contexto, extendiendo `LeadBreadcrumbContext`, en vez de pasar props por el router o un portal.**
El contexto ya modela exactamente esta relación (pantalla → franja del shell) con `trailing`; añadir `actions: ReactNode | null` y un hook `useLeadBreadcrumbActions(node)` simétrico a `useLeadBreadcrumbTrailing` mantiene un solo mecanismo. Alternativas: (a) `createPortal` a un `div` con id en la franja — funciona, pero obliga a que el nodo exista antes de montar la pantalla y no se limpia solo; (b) `handle` de la ruta en `routes.tsx` — las acciones necesitan el estado del contenedor (`openCreate`), que el router no tiene. Fuera del provider el hook sigue siendo no-op, como hoy.

**2. El publicador no se suscribe al valor del contexto.**
Un `ReactNode` es un objeto nuevo en cada render; si el contenedor leyera el contexto que él mismo actualiza, cada publicación lo re-renderizaría y volvería a publicar. Se separa el setter en un contexto propio (estable, sin cambios de identidad) o, equivalente, `useLeadBreadcrumbActions` sólo consume los setters. Así el efecto puede depender del nodo sin memoizarlo en cada pantalla; sólo re-renderiza `LeadBreadcrumb`, que es quien lo pinta. `useLeadBreadcrumbTrailing` no tenía el problema porque publica un string.

**3. La franja pasa a `flex items-center justify-between gap-4`; breadcrumb a la izquierda, `actions` a la derecha.**
Sin acciones el `div` de la derecha no se renderiza, así que las pantallas que no publican nada se ven exactamente como hoy (mismos tests del layout). El botón va con `size="small"`: la franja es una banda de navegación y un botón de altura completa la convertiría otra vez en un encabezado; con `py-3` la altura total apenas cambia. Se confirma visualmente en la revisión manual; si queda débil, subir el tamaño es un cambio de una línea.

**4. `SquadsContainer` publica el botón; se elimina `SquadsHeader`.**
El contenedor es el dueño de `openCreate`, así que es quien llama a `useLeadBreadcrumbActions(<Button …>Nueva célula</Button>)`. `SquadsHeader` queda sin contenido y se borra, en vez de dejarle una fila con sólo el botón (que es justo el espacio a recuperar). El estado vacío inicial conserva su CTA: hoy ya convive con el del encabezado y la primera célula merece la invitación en el centro de la pantalla.

**5. `h1` sr-only en `LeadSquadsPage`, con el texto del breadcrumb.**
Patrón de `LeadPeoplePage` y `AdminPageHeader`: el landmark se conserva para lectores de pantalla y coincide con lo que dice el breadcrumb ("Gestionar Células"). Se ubica en la página, no en el contenedor, y se reemplaza el comentario de `LeadSquadsPage` que hoy explica por qué no había `h1`.

**6. `gap-6` → `gap-2` en la raíz del contenedor, y `py-2` en la franja del breadcrumb y en el `<main>` del shell.**
Tras verlo en el navegador con `gap-4`, el hueco grande no era entre cards y tabla sino entre la franja del breadcrumb (`py-3`) y el contenido (`py-6` del `<main>`): 36px. Con `py-2` en ambos quedan 16px, y el `gap-2` pega el resumen a la tabla. El `<main>` es del layout, así que el padding corto aplica a todas las pantallas del lead; se acepta porque la franja del breadcrumb ya hace de separación con la barra.

## Risks / Trade-offs

- [Los tests de `SquadsContainer` no ven el botón porque renderizan sin shell] → Se envuelve el render con `LeadBreadcrumbProvider` y una sonda que pinta `actions` (mismo truco que `SquadDetailContainer.test.tsx` usa para leer `trailing`). Es la única forma de afirmar "el botón abre el formulario" sin montar el layout entero.
- [Otra pantalla publica acciones y olvida limpiarlas] → El hook limpia al desmontar; no hay API para publicar sin él.
- [Dos botones "Nueva célula" en el vacío inicial] → Aceptado; es la situación actual con el encabezado y ambos abren lo mismo.
- [Inconsistencia temporal con Personas, que conserva su encabezado] → Aceptada; el mecanismo del shell deja la réplica como un change corto.
