## 1. Corregir el primitivo

- [x] 1.1 En `packages/tokens/src/primitives.ts`, cambiar `neutral[25]` de `"#FAFAFA"` a `"#FAFAFB"`.

## 2. Reconstruir y verificar

- [x] 2.1 Reconstruir `@tuya-ui/tokens` (`pnpm --filter @tuya-ui/tokens build`).
- [x] 2.2 Correr `pnpm --filter @tuya-ui/tokens test` (`verify-tokens`) y confirmar que los pares que usan `neutral[25]` (`subtlest text on page background` en claro; los pares que involucran `text.neutral.default`/`background.neutral.boldPressed` en oscuro) siguen pasando. Confirmado: 14.42:1 (claro, antes 14.41), 18.48:1 (oscuro, antes 18.47) — sin cambios de resultado.
- [x] 2.3 Reconstruir `@tuya-ui/components` (consume el CSS de tokens) y correr `tsc --noEmit` en `packages/components` y `apps/docs`. Ambos sin errores.
- [x] 2.4 Levantar `apps/docs` y verificar visualmente que no hay ningún cambio perceptible (el objetivo es que el valor sea el correcto, no que se note). Confirmado en "Básico": sin diferencia visible a simple vista.

## 3. Publicar

- [x] 3.1 `pnpm pack` en `packages/tokens` (y en `packages/components` si el bundle incluye CSS de tokens compilado) y reinstalar en `frontend` (`pnpm install`). Verificado en frontend: cabecera de `/app/lead/personas` y `/app/lead/capacidades` con el valor corregido; el pie (`TableFooter`) no tiene consumidores en `frontend` hoy, así que se verificó en `apps/docs` (pestaña Anatomía, fila "Total"), donde comparte fondo con la cabecera.
- [x] 3.2 Correr `openspec validate --strict` sobre este change. Válido.
