## 1. Tokens

- [x] 1.1 `accent-colors.ts`: matices `sky · blue · violet · magenta`; `accentColorsLight` / `accentColorsDark` con los valores de design.md D4; `accentColors` como alias de claro; comentario con los contrastes medidos y el `#93C5FD` de referencia que no alcanza 3:1.
- [x] 1.2 `tokens.ts` / `index.ts`: exportar ambas paletas y los tipos; `tailwind-preset.ts` sigue derivando `bg-accent-<hue>-fill` de los nombres nuevos.
- [x] 1.3 `generate-css.ts`: el bloque de acento sale del grupo sin tema y se emite en `:root` (claro), `[data-theme="dark"]` y `prefers-color-scheme: dark`.
- [x] 1.4 `verify-tokens.ts`: contraste de los cuatro matices de claro contra fila, lienzo y fila seleccionada; de los de oscuro contra la fila oscura; `checkCssInSync` para ambos. `pnpm run verify` en verde.

## 2. Componentes

- [x] 2.1 `lib/accent-tone.ts`: `AccentTone = "sky" | "blue" | "violet" | "magenta"`, `accentTones` en ese orden; comentario de la escala.
- [x] 2.2 `level-meter.tsx`, `progress.tsx` (SegmentedBar / `segmentFillClass`), y cualquier otro `Record<AccentTone, …>`: claves y clases nuevas. `seniority-card`, `distribution-card`, `capacity-bar` sin cambio de forma.
- [x] 2.3 Tests: `level-meter`, `segmented-bar`, `seniority-card`, `distribution-card`, `capacity-bar` (clases `bg-accent-sky-fill`…); suite en verde.

## 3. Docs y publicación

- [x] 3.1 `apps/docs`: fundamentos (vocabulario de acento con nombres, valores por tema y lectura celeste→magenta), ejemplos de level-meter, progress 05/06, capacity-bar, distribution-card 02; `switch.tsx` si nombra un tono.
- [x] 3.2 Build completo (`pnpm run build` en tokens y components, skill regenerada), `pnpm pack` a `.local-packages`; verificar en la docs que el medidor de cuatro pasos distingue `sky` de `blue` en claro y oscuro.
- [x] 3.3 Avisar que el frontend debe aplicar `adopt-accent-scale-rename` antes de reinstalar el paquete.
