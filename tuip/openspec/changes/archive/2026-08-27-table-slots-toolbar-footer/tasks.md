## 1. Slots en Table

- [x] 1.1 En `packages/components/src/table.tsx`, añadir a `TableProps` `toolbar?: ReactNode` y `footer?: ReactNode` con JSDoc orientado al consumidor (qué zona es, que Table no interpreta el contenido, que el marco aparece sólo con contenido no nulo, que `flush` aplica al marco); el JSDoc es la fuente de `PropsTable`
- [x] 1.2 Renderizar la rama con marco sólo cuando `toolbar != null || footer != null`: `div` marco (`w-full bg-neutral-default`, más `rounded-surface border-default border-neutral-default` salvo `flush`) que contiene la barra (`flex flex-wrap items-center gap-3 px-4 py-3 border-b border-neutral-default`, `rounded-t-surface` salvo `flush`), el `scroller` actual sin borde ni esquinas propias (conserva `ref`, `overflow-x-auto` y las clases de `stickyFirstColumn`) y el pie (`px-4 py-3 border-t border-neutral-default bg-neutral-subtlest`, `rounded-b-surface` salvo `flush`); si falta un slot, el `scroller` conserva el redondeo de ese lado
- [x] 1.3 Mantener la rama sin slots byte a byte como hoy (el `scroller` sigue siendo la raíz con borde y esquinas); comentar en el código por qué el marco es condicional y por qué no lleva `overflow-hidden` (sticky), junto a la advertencia existente

## 2. Pruebas

- [x] 2.1 En `table.test.tsx`, `describe("Barra y pie de Table")`: sin slots la raíz es el `scroller` con las clases de borde de siempre; con `toolbar` el contenido aparece antes del `<table>` y fuera del `scroller`; con `footer` aparece después y fuera; con ambos, un solo nodo lleva el borde y las esquinas
- [x] 2.2 Casos de `flush` con slots (ningún nodo del marco declara borde ni esquinas) y de `toolbar={null}`/`undefined` (sin marco, sin zona vacía)
- [x] 2.3 Caso de `stickyFirstColumn` con slots: el `scroller` sigue recibiendo `data-scrolled` al desplazarse (reutilizar el helper del `describe("Columna fija de Table")`)
- [x] 2.4 Correr `pnpm --filter @tuya-ui/components test` (incluye `tsc --noEmit`, `verify:colors`, `verify:stylesheet`) y `pnpm lint`

## 3. Documentación del catálogo

- [x] 3.1 En `apps/docs/src/content/table.tsx`: añadir a `anatomy.parts` "Barra" (px-4 py-3 · border-b · fuera del scroll) y "Pie (slot)" (px-4 py-3 · border-t · bg-neutral-subtlest); ajustar la nota de "Contenedor" para decir que con slots el marco los envuelve; reescribir el `whenNotToUse` de búsqueda/filtros/paginación ("Table no trae la lógica, pero sí el lugar: `toolbar` y `footer`") y añadir un `pair` do/dont sobre no envolver la tabla en una card propia cuando se usan slots
- [x] 3.2 Reescribir `apps/docs/src/examples/table/03-integracion-completa.tsx` para pasar la fila de búsqueda/densidad como `toolbar` y la `PaginationBar` como `footer` (sin `mb-3`/`mt-3` ni clases de borde), y actualizar `meta.description`/`caption` (quitar "ya no dentro de TableToolbar")
- [x] 3.3 Levantar `pnpm docs:dev` y revisar la página de Table: ejemplo 03 con marco único, ejemplo 04 (Card + flush) sin cambios, ejemplo 05 (matriz con columna fija) sin cambios; abrir un `FilterButton`/popover desde la barra del ejemplo 03 para confirmar que no se recorta

## 4. Entrega

- [x] 4.1 Changeset `minor` de `@tuya-ui/components` (`pnpm changeset`): descripción para quien actualiza — dos slots nuevos, marco único, sin cambios cuando no se usan; mencionar que es la forma recomendada de componer búsqueda/filtros/paginación a partir de ahora
- [x] 4.2 `pnpm publish:local`, anotar la ruta del tarball resultante para el change `adoptar-slots-table-listados` del frontend
