## Why

El catálogo tiene `Modal` y `Drawer` para ocultar contenido secundario, pero ningún patrón para ocultar contenido **dentro del flujo de una misma página** — la alternativa hoy es dejarlo todo expandido o improvisar un `Collapsible` ad hoc por pantalla. Un FAQ, un panel de filtros avanzados o el detalle de una fila con muchos campos necesitan ese patrón de disclosure in-page, que ningún componente existente cubre.

## What Changes

- Se agrega `Accordion` al catálogo como familia compuesta — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` — siguiendo el mismo patrón compositivo que ya usan `Tabs`, `Table` y `Menu`. Construido sobre `@radix-ui/react-accordion`, que resuelve la semántica de encabezado/región expandible y la navegación por teclado (flechas arriba/abajo entre triggers, Home/End a los extremos) sin reimplementarla a mano.
- `Accordion` admite dos modos, igual que la primitiva de Radix: `single` (a lo sumo un ítem abierto a la vez, con `collapsible` para poder cerrar el único abierto) y `multiple` (varios ítems abiertos en simultáneo). `single` es el valor por defecto, por ser el caso más común (FAQ, detalle de una sola sección a la vez).
- Cada `AccordionTrigger` muestra un ícono `chevron-down` que rota 180° al expandirse, reutilizando el mismo ícono que ya usan `Select` y `Combobox` para su propio affordance de apertura — ningún ícono nuevo.
- El divisor entre ítems reutiliza `border-neutral-default`, el mismo token que ya usa `TabsList` para separar la lista de pestañas del contenido, en vez de introducir un tono de borde propio.
- Un `AccordionTrigger` deshabilitado usa el mismo tratamiento visual de deshabilitado que el resto de los controles del catálogo (`text-neutral-disabled`), consistente con `Button` y `TabsTrigger`.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Accordion`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/package.json`: nueva dependencia `@radix-ui/react-accordion`.
- `packages/components/src/accordion.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: nueva entrada, categoría `layout` (misma categoría que `Tabs`), `status: "stable"`, con su `npmDependencies` declarada.
- `apps/docs/src/content/accordion.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/accordion/*.tsx`: ejemplos en vivo, incluidos `single` y `multiple`.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `Accordion`.
