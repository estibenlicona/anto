## Why

El catálogo no tiene forma de representar personas (iniciales sobre un color), avance o proporción (una barra), ni la ruta de navegación dentro de una jerarquía (migas de pan). La definición del sistema (`design-system/Componentes Tuya.dc.html`, sección "Avatar, Progress y Breadcrumb") agrupa estas tres piezas faltantes; se agregan juntas en este change porque ninguna depende de las otras dos ni tiene overlay o estado complejo — son las tres piezas más simples y autónomas que quedan pendientes del catálogo.

## What Changes

- Se agrega `Avatar`: iniciales sobre un fondo neutro fijo (nunca un color derivado del nombre), en tres tamaños (`small`/`medium`/`large`).
- Se agrega `AvatarGroup`: superpone hasta un máximo configurable de `Avatar` con borde blanco de separación, y agrega automáticamente un `Avatar` de "+N" cuando hay más miembros de los que caben.
- Se agrega `Progress`: barra de avance de un solo valor (0–100), que se satura al color `danger` en vez de desbordarse cuando el valor supera 100.
- Se agrega `SegmentedBar`: barra proporcional de varios segmentos con color propio cada uno — "el gráfico por defecto del sistema", según la definición, para mostrar una distribución sin abrir una librería de gráficos.
- Se agrega `Breadcrumb`: ruta de navegación con como máximo tres niveles visibles; con más, colapsa el centro en puntos suspensivos. El último nivel nunca es un enlace.
- Los cinco nacen como `stable`: ninguno introduce un patrón de accesibilidad nuevo sin resolver — reusan roles y patrones (`progressbar`, `nav`/`ol`, texto alternativo) ya estandarizados en HTML, sin overlays ni primitivas nuevas de Radix.
- Se añade contenido de documentación: ejemplos, anatomía y notas de accesibilidad de los cinco.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Avatar`, `AvatarGroup`, `Progress`, `SegmentedBar` y `Breadcrumb`; se añaden sus requisitos de comportamiento.

## Impact

- `packages/components/src/avatar.tsx`: componentes nuevos (`Avatar`, `AvatarGroup`).
- `packages/components/src/progress.tsx`: componentes nuevos (`Progress`, `SegmentedBar`).
- `packages/components/src/breadcrumb.tsx`: componente nuevo (`Breadcrumb`).
- `packages/components/registry/definitions.ts`: tres entradas nuevas (`avatar`, `progress`, `breadcrumb`), todas `status: "stable"`.
- `apps/docs/src/content/avatar.tsx`, `progress.tsx`, `breadcrumb.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/avatar/*.tsx`, `progress/*.tsx`, `breadcrumb/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de comportamiento nuevos.
