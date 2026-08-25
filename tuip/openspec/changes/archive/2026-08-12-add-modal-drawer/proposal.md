## Why

`design-system/Componentes Tuya.dc.html` agrupa "Modal y Drawer" en una misma sección (09) del catálogo, con una regla de comportamiento compartida explícita — foco atrapado, Escape cierra, el foco vuelve al elemento que los abrió, un modal nunca abre otro modal — que hoy nadie puede reproducir: el catálogo no tiene ninguno de los dos. Sin Modal, la confirmación destructiva de `Menu` (el ítem `destructive` que ya existe) no tiene dónde aterrizar; sin Drawer, el detalle de una fila de `Table` solo puede mostrarse navegando a otra pantalla, perdiendo la tabla de contexto.

## What Changes

- Se agrega `Modal` al catálogo: superposición centrada que bloquea la página para decidir algo — confirmar, formulario corto. Familia compuesta `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`, con el mismo vocabulario que ya usa `Card` para header/body/footer.
- Se agrega `Drawer` al catálogo: panel que se desliza desde el borde derecho para consultar el detalle de algo sin perder la tabla o lista detrás. Misma familia compuesta — `Drawer`, `DrawerHeader`, `DrawerBody`, `DrawerFooter`.
- Ambos se construyen sobre `@radix-ui/react-dialog`, la misma primitiva para los dos — difieren en cómo se posiciona y anima el panel (centrado vs. deslizado desde el borde), no en el comportamiento: foco atrapado, Escape cierra, el foco vuelve a quien los abrió, todo resuelto por Radix sin código propio.
- `ModalHeader`/`DrawerHeader` resuelven el título accesible (`Dialog.Title`) y el botón de cerrar (`Dialog.Close`) internamente, para que ningún consumidor tenga que ensamblarlos a mano ni pueda omitir el título que Radix exige para lectores de pantalla.
- Se activa `overlayWidth` (`modalSm/Md/Lg`, `drawerSm/Lg`) en el preset de Tailwind — existe en `packages/tokens/src/layout.ts` desde antes pero nunca se conectó a una clase utilitaria — y `Modal`/`Drawer` lo consumen vía un prop `size`, en vez de fijar 480px como valor arbitrario.
- Ambos usan `elevation.overlay` (superficie `bg-neutral-default` + `shadow-lg`) y la capa `z-overlay` (400), por debajo de `z-menu` (600): un `Select` o `Combobox` abierto desde dentro de un Modal o Drawer sigue flotando por encima de ellos, sin ajuste especial.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Modal` y `Drawer`; se agregan sus requisitos de opciones y el requisito compartido de comportamiento (foco atrapado, Escape, retorno de foco, no anidamiento).

## Impact

- `packages/components/package.json`: nueva dependencia `@radix-ui/react-dialog`.
- `packages/components/src/modal.tsx`, `packages/components/src/drawer.tsx`: componentes nuevos.
- `packages/tokens/src/tailwind-preset.ts`: se agrega `overlayWidth` al tema de Tailwind (nuevas clases de ancho, ninguna clase existente cambia de valor).
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `overlays` (la misma que ya usan `Tooltip` y `Menu`), `status: "stable"`, con sus `npmDependencies` declaradas.
- `apps/docs/src/content/modal.tsx`, `apps/docs/src/content/drawer.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/modal/*.tsx`, `apps/docs/src/examples/drawer/*.tsx`: ejemplos en vivo, incluida la confirmación destructiva del mockup y el detalle de fila.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado, el requisito compartido de comportamiento, y los requisitos de opciones de `Modal` y `Drawer`.
