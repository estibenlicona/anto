## Why

`Navbar Tuya.dc.html` ya asume que existe un command palette: la prop `onSearch` de `Navbar` ("Abre el command palette. Sin handler, el buscador no se muestra.") y la regla explícita "La búsqueda global abre el mismo command palette de ⌘K" dan por hecho que cada producto monta uno propio — pero el catálogo no ofrece ninguno, así que hoy cada equipo lo construiría a mano. `cmdk`, la librería que resuelve la lista filtrable con fuzzy-search, ya está instalada y en uso — pero solo como implementación interna de `Combobox`, nunca expuesta para este caso de uso global.

## What Changes

- Se agrega `CommandPalette` al catálogo: un overlay centrado, disparado globalmente con `⌘K`/`Ctrl+K` desde cualquier parte de la pantalla, con una lista de comandos filtrable a medida que se escribe.
- Expone `CommandPalette`, `CommandPaletteGroup`, `CommandPaletteItem` como familia compuesta — mismo criterio compositivo que `Menu`/`Table`, sin una prop de datos que reemplace JSX.
- El atajo de teclado (`⌘K` en Mac, `Ctrl+K` en Windows/Linux) es interno al componente: se registra y desregistra solo mientras `CommandPalette` está montado, sin exigir que el consumidor implemente su propio listener global.
- Construido combinando `@radix-ui/react-dialog` (ya instalado, mismo overlay centrado y foco atrapado que ya usa `Modal`) con `cmdk` (ya instalado, mismo filtrado por texto que ya usa `Combobox`) — ninguna dependencia nueva.
- `Navbar` no cambia: su prop `onSearch` ya existe y ya está pensada para abrir exactamente este componente; este cambio solo hace que haya algo real que abrir.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `CommandPalette`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/src/command-palette.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: nueva entrada, categoría `overlays` (misma categoría que `Modal`, `Drawer`, `Popover`), `status: "stable"`, con `npmDependencies: ["react", "@radix-ui/react-dialog", "cmdk"]`.
- `apps/docs/src/content/command-palette.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/command-palette/*.tsx`: ejemplos en vivo, incluida la integración con `Navbar` vía `onSearch`.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `CommandPalette`.
