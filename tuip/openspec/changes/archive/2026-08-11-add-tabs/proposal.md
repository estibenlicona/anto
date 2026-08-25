## Why

El catálogo no tiene forma de dividir una vista en secciones navegables sin cambiar de página — hoy la única navegación es la barra lateral global. La definición del sistema (`design-system/Componentes Tuya.dc.html`, sección "Tabs y navegación secundaria") es la siguiente pieza faltante del catálogo, después de la familia de Table/Toolbar/Pagination.

## What Changes

- Se agrega el componente `Tabs` al catálogo, como conjunto compuesto: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- Se construye sobre `@radix-ui/react-tabs`: a diferencia de Checkbox/Radio, no existe un elemento HTML nativo con semántica de pestañas, así que se adopta una primitiva headless — mismo criterio que ya se aplicó para Select, Combobox y Switch.
- `TabsTrigger` admite un contador opcional (`count`), mostrado en fuente monoespaciada junto a la etiqueta, como en la definición ("Capacidades 24").
- Nace como `stable`: reusa la misma familia de primitivas de Radix ya adoptada y verificada, sin introducir un patrón de accesibilidad nuevo sin resolver.
- Se documenta como guía de uso, no como límite forzado por código, la recomendación de la definición: máximo cinco pestañas y nunca dos filas.
- Se añade contenido de documentación: ejemplos, anatomía de las cuatro partes compuestas y notas de accesibilidad.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Tabs`; se añade el requisito de comportamiento de navegación por pestañas.

## Impact

- `packages/components/package.json`: nueva dependencia `@radix-ui/react-tabs`.
- `packages/components/src/tabs.tsx`: componente nuevo (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).
- `packages/components/registry/definitions.ts`: nueva entrada `tabs`, categoría `layout`, `status: "stable"`.
- `apps/docs/src/content/tabs.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/tabs/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y el requisito de comportamiento nuevo.
