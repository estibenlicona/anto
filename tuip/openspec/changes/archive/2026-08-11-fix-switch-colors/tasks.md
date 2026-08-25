## 1. Tokens

- [x] 1.1 Eliminar la interfaz `SwitchBackground` de `packages/tokens/src/semantic-colors.ts`
- [x] 1.2 Eliminar `switch: SwitchBackground` de `SemanticColorPalette.background` y de la firma de `assemble()`
- [x] 1.3 Eliminar las instancias `switch: { trackOff, thumbOff }` de `semanticColorsLight` y `semanticColorsDark`
- [x] 1.4 Regenerar `packages/tokens/dist/tokens.css` y confirmar que las variables `--color-bg-switch-track-off` / `--color-bg-switch-thumb-off` ya no aparecen
- [x] 1.5 Agregar `strong` a `NeutralBackground` (`p.neutral[500]` en claro y en oscuro) — el chequeo de contraste de `neutral-200` contra el thumb falló (1.28:1 claro, necesita 3:1); `neutral-500` es el primer paso de la escala que cumple (decisión del usuario: oscurecer el track en vez de mantener `neutral-200`)
- [x] 1.6 Actualizar el chequeo "switch thumb against switch track" en `scripts/verify-tokens.ts` para leer `background.neutral.strong` y confirmar que `pnpm test` pasa en `packages/tokens`

## 2. Componente Switch

- [x] 2.1 Track apagado: cambiar de `bg-switch-track-off` a `bg-neutral-strong`
- [x] 2.2 Track encendido: confirmar que sigue en `bg-brand-bold` / `border-brand-default` (sin cambios)
- [x] 2.3 Thumb: unificar a una sola clase `bg-neutral-default` para ambos estados, quitando `bg-switch-thumb-off` y el override `data-[state=checked]:bg-neutral-inverse`
- [x] 2.4 Confirmar que ninguna clase del componente referencia `brand` fuera del track encendido

## 3. Documentación del componente

- [x] 3.1 Agregar a la anatomía de `content/switch.tsx` una fila de "par de color" que describa el mapeo: track marca/neutro, thumb blanco fijo

## 4. Cierre

- [x] 4.1 Ejecutar `pnpm build` en `packages/tokens` y `packages/components` sin errores
- [x] 4.2 Recorrer los escenarios de `specs/component-library/spec.md` (Switch) en el sitio corriendo: color del track por estado, thumb blanco en ambos estados
- [x] 4.3 Confirmar que ningún estilo de Switch usa un valor fuera de los tokens del sistema
- [x] 4.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde

## 5. Marcado + deshabilitado

- [x] 5.1 Agregar `disabled:data-[state=checked]:bg-neutral-disabled` y `disabled:data-[state=checked]:border-neutral-disabled` al track, para que ganen sin depender del orden de emisión de Tailwind
- [x] 5.2 Verificar en el sitio corriendo que un Switch marcado y deshabilitado se ve igual que uno no marcado y deshabilitado (mismo gris, sin marca), y que la posición del thumb sigue distinguiendo el estado
- [x] 5.3 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
