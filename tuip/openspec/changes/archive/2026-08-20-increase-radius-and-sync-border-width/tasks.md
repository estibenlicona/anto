## 1. Escala de radio

- [x] 1.1 En `packages/tokens/src/tokens.ts`, cambiar `radius.control` de `"3px"` a `"6px"` y `radius.surface` de `"6px"` a `"10px"`. `radius.none` y `radius.pill` no cambian.
- [x] 1.2 Reconstruir `@tuya-ui/tokens` (`pnpm --filter @tuya-ui/tokens build`).

## 2. Sincronizar ancho de borde

Regla de migración (mecánica, sin cambiar ningún otro valor de clase): la clase nativa de ancho de borde de Tailwind se reemplaza por el token equivalente, mismo ancho, sólo con nombre.
- `border` → `border-default` · `border-2` → `border-bold`
- `border-t`/`border-r`/`border-b`/`border-l` (sin sufijo) → `border-t-default`/`border-r-default`/`border-b-default`/`border-l-default`
- `border-t-2`/`border-r-2`/`border-b-2`/`border-l-2` → `border-t-bold`/`border-r-bold`/`border-b-bold`/`border-l-bold`
- `border-b-0` y cualquier `border-*-0` quedan igual (es "sin borde", no un ancho a nombrar) — no se tocan.
- Las clases de color de borde (`border-neutral-default`, `border-danger-default`, etc.) no se tocan — son un eje distinto (color, no ancho), ya cerrado por `close-native-tailwind-palette`.

- [x] 2.1 Migrar en `packages/components/src/`: `accordion.tsx`, `alert.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `combobox.tsx`, `command-palette.tsx`, `date-calendar.tsx`, `date-field.tsx`, `date-range-field.tsx`, `drawer.tsx`, `file-input.tsx`, `file-uploader.tsx`, `filter-button.tsx`, `input.tsx`, `menu.tsx`, `modal.tsx`, `navbar.tsx`, `notification-menu.tsx`, `pagination.tsx`, `popover.tsx`, `radio-group.tsx`, `search-field.tsx`, `segmented-control.tsx`, `select.tsx`, `sidebar.tsx`, `slider.tsx`, `stepper.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`. La primera pasada (basada en la búsqueda hecha antes de escribir este change) no capturó las variantes direccionales `border-b`/`border-t`/`border-l` en varios de esos mismos archivos (`card.tsx`, `combobox.tsx`, `command-palette.tsx`, `menu.tsx`, `modal.tsx`, `navbar.tsx`, `notification-menu.tsx`, `segmented-control.tsx`, `table.tsx`) — una segunda pasada con una expresión regular más precisa las encontró y migró también.
- [x] 2.2 Verificar con una búsqueda que no queda ninguna clase de ancho de borde nativa sin nombrar: ningún `border`/`border-2`/`border-{t,r,b,l}`/`border-{t,r,b,l}-2` suelto en `packages/components/src/*.tsx` (las clases de color `border-{rol}-{énfasis}` y los `border-*-0` quedan afuera de esta búsqueda a propósito). Confirmado con dos pasadas: la segunda, con la expresión corregida, no encontró ningún resto.

## 3. Spec

- [x] 3.1 Actualizar `openspec/specs/design-tokens/spec.md` — MODIFIED "Ancho de borde" (agrega el escenario del caso estándar) y ADDED "Escala de radio de esquinas" — ya redactado en `specs/design-tokens/spec.md` de este change; se sincroniza al archivar.

## 4. Verificación

- [x] 4.1 Reconstruir `@tuya-ui/components` (`pnpm --filter @tuya-ui/components build`) y confirmar que no falla. Build, registro (46 componentes) y skill generados sin errores.
- [x] 4.2 Correr `tsc --noEmit` en `packages/components` y en `apps/docs`. Ambos sin errores.
- [x] 4.3 Levantar `apps/docs` y verificar visualmente: la sección "Fundamentos" (radio y ancho de borde) refleja los valores nuevos; una muestra representativa de componentes (Card, Button, Input, Table, Modal, Menu) se ve con esquinas más marcadas y el mismo ancho de borde de antes (sin cambio de peso visual). Confirmado en `/fundamentos/espaciado#radios` (control=6px, surface=10px, ancho de borde sin cambios) y visualmente en Table y Modal — esquinas notoriamente más redondeadas, mismo peso de borde.
- [x] 4.4 Repetir la publicación local (`pnpm pack` en `packages/tokens` y `packages/components`) y reinstalar en `frontend` (`pnpm install`), y verificar visualmente en `/app/lead/personas` (la tabla con paginación integrada) que el radio de la tarjeta se ve más marcado, igual que la referencia. `pnpm install` no detectó cambios (mismo tarball/versión) — hizo falta `pnpm install --force` y limpiar `node_modules/.vite` + reiniciar el server, misma staleness ya conocida de sesiones anteriores. Confirmado con zoom sobre la esquina de la tabla: radio claramente más marcado.
- [x] 4.5 Correr `openspec validate --strict` sobre este change. Válido.

## 5. Revisión: radio un poco más pronunciado todavía

- [x] 5.1 En `packages/tokens/src/tokens.ts`, cambiar `radius.control` de `"6px"` a `"8px"` y `radius.surface` de `"10px"` a `"12px"`.
- [x] 5.2 Reconstruir `@tuya-ui/tokens` (`pnpm --filter @tuya-ui/tokens build`).
- [x] 5.3 Reconstruir `@tuya-ui/components` y correr `tsc --noEmit` en `packages/components` y `apps/docs`. Ambos sin errores.
- [x] 5.4 Levantar `apps/docs` y verificar visualmente en `/fundamentos/espaciado#radios` que la tabla de valores muestra `control=8px`/`surface=12px`, y en un componente real (Table o Modal) que el radio se ve más marcado que en la revisión anterior. Confirmado: `control=8px`, `surface=12px` reflejados en la tabla y en la muestra visual.
- [x] 5.5 Repetir la publicación local (`pnpm pack` en `packages/tokens` y `packages/components`) y reinstalar en `frontend` (`pnpm install --force`, más limpiar `node_modules/.vite` y reiniciar el server si `pnpm install` no detecta cambios), y verificar visualmente en `/app/lead/personas`. Confirmado: radio claramente más marcado.
- [x] 5.6 Correr `openspec validate --strict` sobre este change. Válido.

## 6. Segunda revisión: un poco más de radio todavía

- [x] 6.1 En `packages/tokens/src/tokens.ts`, cambiar `radius.control` de `"8px"` a `"10px"` y `radius.surface` de `"12px"` a `"14px"` (mismo incremento de +2px que la revisión anterior).
- [x] 6.2 Reconstruir `@tuya-ui/tokens` (`pnpm --filter @tuya-ui/tokens build`).
- [x] 6.3 Reconstruir `@tuya-ui/components` y correr `tsc --noEmit` en `packages/components` y `apps/docs`. Ambos sin errores.
- [x] 6.4 Levantar `apps/docs` y verificar visualmente en `/fundamentos/espaciado#radios` que la tabla de valores muestra `control=10px`/`surface=14px`. Confirmado.
- [x] 6.5 Repetir la publicación local (`pnpm pack` en `packages/tokens` y `packages/components`) y reinstalar en `frontend` (`pnpm install --force` + limpiar `node_modules/.vite` + reiniciar el server), y verificar visualmente en `/app/lead/personas`. Confirmado.
- [x] 6.6 Correr `openspec validate --strict` sobre este change. Válido.

## 7. Tercera revisión: de vuelta a 8px/12px, quedó muy pronunciado en 10px/14px

- [x] 7.1 En `packages/tokens/src/tokens.ts`, cambiar `radius.control` de `"10px"` a `"8px"` y `radius.surface` de `"14px"` a `"12px"` — vuelve exactamente al valor de la revisión del grupo 5.
- [x] 7.2 Reconstruir `@tuya-ui/tokens` (`pnpm --filter @tuya-ui/tokens build`).
- [x] 7.3 Reconstruir `@tuya-ui/components` y correr `tsc --noEmit` en `packages/components` y `apps/docs`. Ambos sin errores.
- [x] 7.4 Levantar `apps/docs` y verificar visualmente en `/fundamentos/espaciado#radios` que la tabla de valores muestra `control=8px`/`surface=12px`. Confirmado.
- [x] 7.5 Repetir la publicación local y reinstalar en `frontend`. **Hallazgo real, corrige una memoria previa incorrecta**: `frontend/package.json` apunta a `file:../tuip/.local-packages/tuya-ui-*-0.1.0.tgz`, no a `packages/*/tuya-ui-*-0.1.0.tgz` — `pnpm pack` corrido directamente en `packages/components`/`packages/tokens` (lo usado en todas las revisiones anteriores de este change) empaqueta al lugar que `frontend` **no** lee; por eso ninguna de esas revisiones había llegado nunca realmente instalada, y sólo parecía funcionar porque `apps/docs` (que sí importa directo de `packages/*`) mostraba el valor correcto. El comando correcto es `pnpm run publish:local` desde la raíz de `tuip` (corre `scripts/publish-local.ts`, que builda y empaqueta con `--pack-destination .local-packages`). Además, incluso apuntando al lugar correcto, el store de pnpm en `frontend` seguía sirviendo contenido viejo hasta borrar a mano `frontend/node_modules/.pnpm/@tuya-ui+*` y `frontend/node_modules/@tuya-ui/{components,tokens}` antes de `pnpm install --force` (recién ahí el output mostró `downloaded 2`, no sólo `reused`). Verificado con `getComputedStyle` en el DOM real: `12px`.
- [x] 7.6 Correr `openspec validate --strict` sobre este change. Válido.
