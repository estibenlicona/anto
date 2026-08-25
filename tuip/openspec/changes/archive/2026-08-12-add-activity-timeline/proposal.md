## Why

El catálogo no tiene ninguna forma de mostrar "quién hizo qué y cuándo" — el registro de auditoría que un flujo de aprobaciones necesita como respaldo. El usuario pidió agregar exactamente este componente a partir de una captura del mockup: **Activity timeline**, historial y trazabilidad, donde cada entrada nombra al actor, la acción y el objeto, en ese orden.

**Nota de trazabilidad, distinta a la de cada change anterior:** esta sección no está en `design-system/Componentes Tuya.dc.html` — se buscó por título, por las variables de la captura (Ospina, Restrepo, Betancur, SOL-2041) y por el texto de la descripción, y ninguna aparece en el archivo. El archivo tiene 14 secciones y ninguna es esta. La captura que el usuario adjuntó es, para este change, la única fuente visual — no un archivo del repositorio verificable por grep como en cada change anterior. El resto de este proposal se apoya en esa captura con la misma exigencia que antes se le aplicó al `.dc.html`, pero conviene decirlo: es una fuente distinta, no la de siempre.

Lo que la captura sí muestra con claridad, sin ambigüedad de interpretación: cuatro entradas, cada una con un punto de color, un actor en negrita seguido de la acción en texto regular, una línea secundaria con el detalle, y una marca de tiempo relativa alineada a la derecha. Los cuatro colores de punto observados — verde, rojo, azul, gris — coinciden exactamente con los roles de estado que `Badge` ya usa (`success`, `danger`, `info`, `neutral`), y además coinciden semánticamente con cada acción: aprobar es `success`, un umbral superado es `danger`, crear una solicitud es `info`, una actualización de rutina es `neutral`. Esa doble coincidencia — visual y semántica — es lo que permite reusar el mapeo de `Badge` sin pedirle a la captura una precisión de píxel que no se le puede exigir a una imagen.

## What Changes

- Se agrega `ActivityTimeline` al catálogo: familia compuesta `ActivityTimeline` (lista) y `ActivityTimelineItem` (cada entrada), siguiendo el mismo patrón compositivo que ya usan `Card`, `Table` y `Menu`.
- `ActivityTimelineItem` separa `actor` y `action` como props propias — no un solo nodo de texto libre — para que el componente mismo imponga "el actor primero, distinguido tipográficamente" en vez de dejarlo a la disciplina de quien lo usa.
- El color del punto reusa exacto el mapeo de rol que ya valida `Badge` (`bg-{role}-bold`, con el mismo truco de `bg-current` para `neutral`) — ningún token nuevo.
- Sin container propio: `ActivityTimeline` no trae su propio borde ni fondo, la misma decisión ya tomada para `EmptyState` — se monta dentro de lo que corresponda (un `Card`, el `DrawerBody` de un detalle de fila) en vez de imponer una superficie fija.
- El color del punto es un refuerzo, no la única fuente: la acción siempre se relata en texto (`action`), así que quien no distingue el color igual entiende qué pasó.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `ActivityTimeline`; se agrega su requisito de opciones.

## Impact

- `packages/components/src/activity-timeline.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: entrada nueva, categoría `feedback` (junto a `EmptyState`, `Skeleton`, `Toast` — componentes que informan un estado, no que lo activan), `status: "stable"`, sin `npmDependencies` fuera de `react`.
- `apps/docs/src/content/activity-timeline.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/activity-timeline/*.tsx`: ejemplos en vivo, incluida la traza de aprobación completa que ilustra la captura.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `ActivityTimeline`.
