## Why

`Fundamentos Tuya DS.dc.html` ya define `Popover` como una de las cuatro superficies superpuestas del sistema (junto a Modal, Cajón lateral y Tooltip), con su propio ancho (280–360px), su padding interior (16px) y su capa de z-index — pero ningún componente del catálogo lo implementa. `@radix-ui/react-popover` ya está instalado y en uso, aunque solo como implementación interna de `Combobox`, `DateField` y `DateRangeField`; no existe una forma de usar ese mismo patrón para su caso de uso propio — "filtros de columna, selectores múltiples" — sin duplicar esa lógica a mano en cada pantalla que lo necesite.

## What Changes

- Se agrega `Popover` al catálogo como familia compuesta — `Popover`, `PopoverTrigger`, `PopoverContent` — con la misma anatomía en tres partes que ya usa Radix internamente en `Combobox`/`DateField`, ahora expuesta como componente propio en vez de quedar enterrada en la implementación de otros tres.
- `PopoverContent` usa el ancho mínimo de la definición (`w-popover-min`, 280px, token `overlayWidth.popoverMin` ya existente y sin usar) y padding interior de 16px (`p-4`), consistente con "Filtros de columna, selectores múltiples. Padding interior de 16" del catálogo de fundamentos. El consumidor puede ensanchar hasta el máximo de la definición (360px) vía `className` cuando el contenido lo requiera.
- Comparte la capa de apilamiento `z-menu` con `Menu`, tal como agrupa la propia definición ("Popover y menú: 600") — ningún z-index nuevo.
- No introduce ninguna dependencia nueva: `@radix-ui/react-popover` ya está en `packages/components/package.json`.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Popover`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/src/popover.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: nueva entrada, categoría `overlays` (misma categoría que `Menu` y `Tooltip`), `status: "stable"`, con `npmDependencies: ["react", "@radix-ui/react-popover"]` (ya declarada en otros componentes, ahora también en este).
- `apps/docs/src/content/popover.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/popover/*.tsx`: ejemplos en vivo, incluido un panel de filtros.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `Popover`.
