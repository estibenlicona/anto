## 1. Cerrar la paleta en el preset

- [x] 1.1 En `packages/tokens/src/tailwind-preset.ts`, mover `backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke` y `colors` de `theme.extend` a la raíz de `theme` — el mismo tratamiento que ya tiene `fontSize`, y por el mismo motivo.
- [x] 1.2 Agregar `transparent: "transparent"` y `current: "currentColor"` a cada uno de esos seis objetos. Sin esto, los 25 usos existentes de `border-transparent`, `bg-transparent`, `bg-current` y `border-current` dejan de compilar.
- [x] 1.3 Dejar anotado junto al cambio por qué se reemplaza y no se extiende (mismo comentario que ya explica el caso de `fontSize`, aplicado a color), y por qué `transparent`/`current` se preservan y `white`/`black` no.
- [x] 1.4 Confirmar que `ringColor`, `divideColor` y `outlineColor` —namespaces que Tailwind deriva de `colors` por defecto— quedan cerrados sin necesidad de declararlos aparte.

## 2. Migrar los dos usos de white/black en apps/docs

- [x] 2.1 En `apps/docs/src/components/SearchDialog.tsx`, cambiar `backdrop:bg-black/40` al mismo patrón que ya usan Modal, Drawer y CommandPalette para su overlay.
- [x] 2.2 En `apps/docs/src/components/ComponentChips.tsx`, cambiar `border-white/25`. Nota de implementación: el target planeado (`border-neutral-soft`) resultó incorrecto — `ComponentChips` vive sobre `bg-neutral-inverse`, una superficie que siempre es la opuesta al tema activo, mientras que `border.neutral.soft` asume una superficie que sigue el tema normalmente. Se usó `currentColor` en su lugar, heredando el mismo color que ya usa el texto del botón, que sí se invierte junto con el fondo y por eso siempre contrasta. El modificador `/25` no compiló sobre ningún color del preset (confirmado en el CSS generado y en el navegador — `.border-current` no tiene variante `/25`, ninguna clase con `/` genera opacidad), así que la opacidad se expresó como valor arbitrario (`color-mix(in_srgb,currentColor_25%,transparent)`) en vez de modificador. Verificado en el navegador en ambos temas: `border-left-color` resuelve a blanco/25% en modo claro y al tono oscuro equivalente/25% en modo oscuro.
- [x] 2.3 Confirmar que no queda ningún otro uso de `white`/`black` en `apps/docs/src` ni en `packages/components/src` antes de dar el cierre por completo.

## 3. Reconstrucción y verificación

- [x] 3.1 Reconstruir `@tuya-ui/tokens`.
- [x] 3.2 Reconstruir `@tuya-ui/components` y confirmar que el build no falla — si algo dependía en silencio de un color nativo, se manifiesta acá. Build limpio, sin errores.
- [x] 3.3 Correr la verificación de contraste de tokens (`verify-tokens`) y confirmar que sigue pasando: este cambio no toca ningún valor, sólo qué se expone como utilidad. 50/50 checks OK, ambos modos.
- [x] 3.4 Levantar `apps/docs` y confirmar visualmente que nada se rompió, en particular el overlay del buscador y el botón de copiar de los chips de componente. Verificado en el navegador: el overlay del buscador oscurece la página al abrir (`bg-neutral-bold/40`), y el chip de comando renderiza sin romperse en ambos temas.
- [x] 3.5 Confirmar en el navegador, con una prueba directa, que un color nativo de Tailwind (por ejemplo `bg-blue-500`) no genera ninguna regla — no alcanza con revisar el código fuente, hay que verlo resuelto. Confirmado: un elemento de prueba con `bg-blue-500` resuelve a `background-color: rgba(0, 0, 0, 0)` (sin regla aplicada), mientras que `bg-neutral-default` sí resuelve al color del token.
- [x] 3.6 Correr `tsc --noEmit` en `packages/tokens` y `packages/components`. Ambos limpios, sin errores.
