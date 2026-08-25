## 1. Avatar: color categórico

- [x] 1.1 En `packages/components/src/avatar.tsx`, agregar `color?: CategoricalColor` a `AvatarProps` y un `Record<CategoricalColor, string>` con las seis clases `bg-{family}-bold text-neutral-inverse` (literales, mismo patrón que `colorClasses` en `tag.tsx`), por defecto sin color → tratamiento neutro actual sin cambios.
- [x] 1.2 Actualizar `apps/docs/src/content/avatar.tsx` con el prop nuevo, y agregar un ejemplo en `apps/docs/src/examples/avatar/` mostrando varios Avatar con distintos colores asignados explícitamente (no derivados del nombre).

## 2. Nuevo SearchField

- [x] 2.1 Crear `packages/components/src/search-field.tsx`: envuelve `Input` agregando un ícono de lupa posicionado a la izquierda y el padding correspondiente; reenvía el resto de los props de `Input` (label, error, placeholder, value, onChange, ref).
- [x] 2.2 Exportar `SearchField` desde `packages/components/src/index.ts`.
- [x] 2.3 Crear `apps/docs/src/content/search-field.tsx` y al menos un ejemplo en `apps/docs/src/examples/search-field/`.

## 3. Nuevo FilterButton

- [x] 3.1 Crear `packages/components/src/filter-button.tsx`: `PopoverTrigger` estilizado como botón (etiqueta + `Icon` `chevron-down`, indicador de estado activo cuando `selected.length > 0`) envolviendo un `PopoverContent` con un `Checkbox` por opción; props controladas `options`, `selected`, `onChange`, `label`.
- [x] 3.2 Exportar `FilterButton` desde `packages/components/src/index.ts`.
- [x] 3.3 Crear `apps/docs/src/content/filter-button.tsx` y al menos un ejemplo en `apps/docs/src/examples/filter-button/`.

## 4. Nuevo PaginationBar

- [x] 4.1 Crear `packages/components/src/pagination-bar.tsx`: recibe `page`, `pageCount`, `onPageChange` (reenviados sin cambios a `Pagination`), más `total`, `pageSize`, `pageSizeOptions`, `onPageSizeChange`; calcula el rango mostrado ("Mostrando X–Y de Z") a partir de `page`/`pageSize`/`total` y lo muestra a la izquierda, con el selector de tamaño de página y `Pagination` a la derecha.
- [x] 4.2 Exportar `PaginationBar` desde `packages/components/src/index.ts`.
- [x] 4.3 Crear `apps/docs/src/content/pagination-bar.tsx` y al menos un ejemplo en `apps/docs/src/examples/pagination-bar/`.

## 5. Cabecera de Table: blanca y más compacta

- [x] 5.1 En `packages/components/src/table.tsx`, cambiar el fondo de `TableHeader` de `bg-neutral-subtle` a `bg-neutral-default`.
- [x] 5.2 Agregar un `headerCellPadding: Record<TableDensity, string>` propio de `TableHead`, más bajo que `cellPadding` del cuerpo en cada densidad (por ejemplo `py-2`/`py-1` contra `py-3`/`py-1.5`), y usarlo en `TableHead` en vez del `cellPadding` compartido.
- [x] 5.3 Actualizar los ejemplos de Table en `apps/docs/src/examples/table/` y su ficha en `apps/docs/src/content/table.tsx` para reflejar la cabecera nueva.

## 6. Retirar TableToolbar

- [x] 6.1 Eliminar `packages/components/src/table-toolbar.tsx` y su export en `packages/components/src/index.ts`.
- [x] 6.2 Eliminar `apps/docs/src/content/table-toolbar.tsx` y `apps/docs/src/examples/table-toolbar/`.
- [x] 6.3 Actualizar `apps/docs/src/examples/table/03-integracion-completa.tsx` (y `apps/docs/src/content/table.tsx` si referencia a `TableToolbar` en su texto) para componer `SearchField` + `FilterButton` + `PaginationBar` sueltos en vez de `TableToolbar`.

## 7. Verificación

- [x] 7.1 Reconstruir `@tuya-ui/components` (`pnpm --filter @tuya-ui/components build`) y confirmar que no falla — un import roto a `TableToolbar` en algún ejemplo se manifiesta acá.
- [x] 7.2 Correr `tsc --noEmit` en `packages/components` y en `apps/docs`.
- [x] 7.3 Levantar `apps/docs` y verificar visualmente. Verificado: cabecera de Table blanca y compacta en "Básico"; ejemplo "Integración completa" con SearchField suelto (sin caja), densidad, tabla y PaginationBar ("Mostrando 1–3 de 5" + selector "3 por página" + navegación) funcionando juntos; FilterButton abre el popover con 5 checkboxes, marcar "Senior" activa el trigger (borde/fondo brand) y muestra el contador "1"; Avatar "Color categórico" muestra los 5 colores distintos (azul/ámbar/morado/verde/rojo) asignados explícitamente, no derivados del nombre. Nada referencia `TableToolbar`.
- [x] 7.4 Correr `openspec validate --strict` sobre este change.

## 8. Revisión: fondo y tipografía de la cabecera

- [x] 8.1 En `packages/tokens/src/semantic-colors.ts`, agregar `muted: p.neutral[400]` a `background.neutral` en `semanticColorsLight`, y `muted: p.neutral[500]` (mismo valor que `strong` ahí) en `semanticColorsDark`.
- [x] 8.2 En `packages/tokens/scripts/verify-tokens.ts`, agregar el caso `"${mode}: header text on muted background"` (`text: colors.text.neutral.default`, `background: colors.background.neutral.muted`, `minRatio: 4.5`) a la lista de pares verificados.
- [x] 8.3 Reconstruir `@tuya-ui/tokens` y correr `pnpm --filter @tuya-ui/tokens test` (`verify-tokens`), confirmando que el caso nuevo pasa.
- [x] 8.4 En `packages/components/src/table.tsx`: cambiar el fondo de `TableHeader` de `bg-neutral-default` a `bg-neutral-muted`; cambiar el texto de `TableHead` de `text-neutral-subtle` a `text-neutral-default` y agregar `font-bold` junto al `uppercase` ya existente.
- [x] 8.5 Actualizar `apps/docs/src/content/table.tsx`: la nota de "Cabecera" (fondo) y "Padding de cabecera"/tipografía para reflejar `bg-neutral-muted`, `text-neutral-default` y `font-bold`.
- [x] 8.6 Reconstruir `@tuya-ui/components` y correr `tsc --noEmit` en `packages/components` y `apps/docs`.
- [x] 8.7 Levantar `apps/docs` y verificar visualmente: la cabecera de Table en gris sólido, texto en mayúsculas y negrita, legible. Verificado en "Básico" y en "Integración completa" (incluida la columna ordenable "CAPACIDAD", cuyo botón interno también quedó consistente con el resto de la cabecera).
- [x] 8.8 Repetir la publicación local (`pnpm pack` en `packages/components`) y reinstalar en `frontend` (`pnpm install`), y verificar visualmente en `/app/lead/personas` que la cabecera ya muestra el fondo gris nuevo. Confirmado.
- [x] 8.9 Correr `openspec validate --strict` sobre este change.

## 9. Segunda revisión: cabecera y pie casi blancos, cuerpo blanco explícito

- [x] 9.1 En `packages/tokens/src/semantic-colors.ts`: quitar `muted` de la interfaz `NeutralBackground` y su docblock, y quitar `muted: p.neutral[400]`/`muted: p.neutral[600]` de `semanticColorsLight`/`semanticColorsDark`.
- [x] 9.2 En `packages/tokens/scripts/verify-tokens.ts`: quitar el caso `"${mode}: header text on muted background"`, y agregar `"${mode}: header text on subtlest background"` (`text: colors.text.neutral.default`, `background: colors.background.neutral.subtlest`, `minRatio: 4.5`).
- [x] 9.3 Reconstruir `@tuya-ui/tokens` y correr `pnpm --filter @tuya-ui/tokens test` (`verify-tokens`), confirmando que el caso nuevo pasa y que no queda ninguna referencia a `muted`. Verificado: 14.41:1 (claro) y 18.47:1 (oscuro).
- [x] 9.4 En `packages/components/src/table.tsx`: cambiar el fondo de `TableHeader` de `bg-neutral-muted` a `bg-neutral-subtlest`; cambiar el fondo de `TableFooter` de `bg-neutral-subtle` a `bg-neutral-subtlest`; agregar `bg-neutral-default` al `div` contenedor de `Table`. Actualizar los comentarios que describen el fondo de `TableHeader`/`TableFooter` (ya no aplica "banda gris sólida").
- [x] 9.5 Actualizar `apps/docs/src/content/table.tsx`: la entrada "Cabecera" (`measure`/nota) para reflejar `bg-neutral-subtlest`; la entrada "Pie" para reflejar que ahora comparte el mismo fondo que la cabecera (ya no dice "un tono distinto"); agregar una entrada "Cuerpo" describiendo el `bg-neutral-default` explícito del contenedor.
- [x] 9.6 Reconstruir `@tuya-ui/components` y correr `tsc --noEmit` en `packages/components` y `apps/docs`. Ambos sin errores.
- [x] 9.7 Levantar `apps/docs` y verificar visualmente: cabecera y pie casi blancos (apenas diferenciados), cuerpo blanco, texto de cabecera legible en mayúsculas y negrita. Verificado en "Básico" (cabecera) y en "Anatomía" (fila "Total" del pie, mismo fondo que la cabecera).
- [x] 9.8 Repetir la publicación local (`pnpm pack` en `packages/components`, más `packages/tokens` si su tarball también se reinstala) y reinstalar en `frontend` (`pnpm install`), y verificar visualmente en `/app/lead/personas` que la tabla ya muestra el fondo nuevo. Confirmado: cabecera casi blanca, cuerpo blanco.
- [x] 9.9 Correr `openspec validate --strict` sobre este change. Válido.
