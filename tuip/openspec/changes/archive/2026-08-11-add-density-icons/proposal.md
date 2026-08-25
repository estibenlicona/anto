## Why

Las opciones de densidad de Table (`Cómoda`/`Compacta`, el `SegmentedControl` que se usa junto a `TableToolbar`) se piden como iconos en vez de texto. Verificado contra la librería completa (`packages/components/src/icons/paths.ts`, ~68 iconos) y el mockup fuente (`Iconografia Tuya.dc.html`): **no existe ningún icono que represente estos dos conceptos**. Agregarlos requiere seguir el método que el propio sistema documenta (`openspec/specs/iconography/spec.md` — "Método para incorporar un icono nuevo"): elegir el nombre, dibujar en el mockup a partir de las figuras guía, y extraer con el script — nunca escribir el path a mano en el código.

Además, `SegmentedControl` hoy solo admite un `label` de texto visible por opción; no tiene forma de que una opción sea únicamente un icono con nombre accesible.

## What Changes

- Se agregan dos iconos a la familia `data` de la librería: `density-comfortable` (3 filas altas) y `density-compact` (5 filas finas), dibujados sobre el mismo rectángulo guía que ya usan `table` y `layout`, distinguibles de `menu` (sin caja contenedora) y de `table` (que además tiene divisores de columna).
- `SegmentedControlOption` admite un `icon` opcional; cuando una opción lo trae, se renderiza el icono en vez del texto y el texto pasa a ser su nombre accesible (`aria-label`), en vez de texto visible.
- Los ejemplos de densidad (`examples/segmented-control/01-densidad.tsx`, `examples/table-toolbar/01-busqueda-y-densidad.tsx`) y la doc de Table pasan a usar las opciones con icono.
- **Riesgo declarado**: el dibujo de los dos iconos nuevos es un boceto que sigue las reglas de construcción del sistema, pero la verificación de que "no desentona junto a los existentes" y de legibilidad en el tamaño menor (16px) — ambas exigidas por la spec de iconografía — requieren revisión visual humana antes de darse por aprobados. Este change dibuja el boceto y deja explícita esa revisión como parte de las tareas, no como algo ya resuelto.

## Capabilities

### Modified Capabilities

- `component-library`: `SegmentedControl` admite opciones representadas solo por icono, con nombre accesible obligatorio en ese caso.

No se declara `iconography` como capability modificada: su requisito "Librería de iconos del sistema" ya exige cubrir el vocabulario de dominio en términos generales, sin enumerar iconos por nombre; agregar `density-comfortable`/`density-compact` llena ese requisito existente, no le cambia el texto.

## Impact

- `design-system/Iconografia Tuya.dc.html`: dos celdas nuevas en la sección "Datos y análisis", que pasa de contar 10 a 12.
- `packages/components/scripts/extract-icons.ts`: el `expected` de la familia `data` pasa de 10 a 12.
- `packages/components/src/icons/paths.ts`: regenerado por el script de extracción (no se edita a mano).
- `packages/components/src/segmented-control.tsx`: prop `icon` opcional por opción; icono + `aria-label` en vez de texto visible cuando está presente.
- `apps/docs/src/examples/segmented-control/01-densidad.tsx`, `apps/docs/src/examples/table-toolbar/01-busqueda-y-densidad.tsx`: opciones de densidad con icono.
- `apps/docs/src/content/segmented-control.tsx`: se documenta la variante con icono en anatomía/accesibilidad.
- `openspec/specs/iconography/spec.md`, `openspec/specs/component-library/spec.md`: requisitos actualizados.
