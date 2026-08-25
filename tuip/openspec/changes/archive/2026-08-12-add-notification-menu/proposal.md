## Why

`design-system/Componentes Compuestos Tuya.dc.html` trae, en su sección 12 (línea 494), "Notification menu": el panel que cuelga de la campana de la barra superior, con una regla de contenido explícita — "Solo eventos accionables: si el usuario no puede hacer nada al respecto, va al historial, no a la campana." — que hoy nada en el catálogo implementa. `Menu` ya resuelve el ancla, el teclado y el cierre para un panel flotante, pero su fila (ícono + una línea de texto) no alcanza para una notificación real (título, detalle, hora, estado leído/no leído).

Esta sección, a diferencia de la mayoría, no está escrita como marcado estático: usa una plantilla (`sc-for`) sobre un arreglo de datos definido más abajo en el mismo archivo (línea 608, `notifs: [...]`). De ahí salen los cuatro ejemplos reales y, más importante, los valores exactos de color — que resultan calzar sin excepción con primitivos ya nombrados en el sistema (`p.danger[600]`, `p.warning[600]`, `p.brand[600]`), algo que no había pasado con esta limpieza en ningún change anterior de esta serie.

## What Changes

- Se agrega `NotificationMenu` al catálogo: familia compuesta `NotificationMenu` (panel), `NotificationMenuHeader` (título + acción opcional), `NotificationMenuList` (la única pieza que scrollea), `NotificationMenuItem` (cada notificación) y `NotificationMenuFooter` (acción de cierre, p. ej. "Ver todas").
- Construido sobre `@radix-ui/react-dropdown-menu` — la misma primitiva que ya usa `Menu`, no una reimplementación — pero como componente propio y no como un envoltorio de `Menu`/`MenuItem`: el contenido de una notificación (punto + título + detalle + hora, con estado leído/no leído) no entra en la fila de ícono+etiqueta que `MenuItem` ya resuelve, la misma razón por la que `Modal` y `Drawer` comparten `@radix-ui/react-dialog` sin que uno envuelva al otro.
- `NotificationMenuItem` recibe un solo prop `unread` y deriva de ahí, a la vez, el fondo y el peso tipográfico — el mismo par de señales que la fuente cambia siempre junto.
- El punto de color de cada ítem reusa el mismo vocabulario de rol que ya validan `Badge` y `ActivityTimeline` (`success`/`info`/`warning`/`danger`/`discovery`/`neutral`), resuelto exacto contra los primitivos que la fuente usa: `bg-danger-bold` (`p.danger[600]`, alerta crítica), `bg-warning-bold` (`p.warning[600]`, pendiente de aprobación). El punto neutral reusa la misma convención que ya fijó `ActivityTimeline` para el suyo, en vez de perseguir el gris ligeramente distinto que esta sección usa por su cuenta — la propia fuente no es consistente consigo misma en ese gris entre sus dos secciones.
- El texto de "Marcar todas leídas" y "Ver todas" reusa `text-brand-default` (`p.brand[600]`) sin cambio — el mismo tono, con el mismo comentario ya presente en el código fuente de tokens explicando por qué el rojo de marca no alcanza contraste como texto sobre blanco.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `NotificationMenu`; se agrega su requisito de opciones.

## Impact

- `packages/components/src/notification-menu.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: entrada nueva, categoría `overlays` (junto a `Tooltip`, `Menu`, `Modal`, `Drawer`), `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-dropdown-menu"]` — ya instalada, sin agregar ninguna dependencia nueva al monorepo.
- `apps/docs/src/content/notification-menu.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/notification-menu/*.tsx`: ejemplos en vivo, incluidas las cuatro notificaciones reales de la fuente con sus dos ítems no leídos y dos leídos.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `NotificationMenu`.
