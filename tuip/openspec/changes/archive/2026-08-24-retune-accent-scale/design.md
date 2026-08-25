## Context

- `packages/tokens/src/accent-colors.ts` define `accentScale = { slate, blue, teal, purple }` con un solo `fill` por matiz, independiente del tema; `generate-css.ts` lo emite una vez en `:root` (línea 23) junto a los tokens sin tema, y el bloque semántico sí se emite por tema (`:root` claro, `[data-theme="dark"]` y `prefers-color-scheme`).
- `verify-tokens.ts` → `buildAccentContrastChecks` prueba cada `fill` contra cuatro superficies (fila clara, lienzo, fila seleccionada, fila oscura) a 3:1.
- `packages/components/src/lib/accent-tone.ts` es el vocabulario (`AccentTone`, `accentTones` en orden); `level-meter.tsx` y `progress.tsx` mapean `Record<AccentTone, "bg-accent-*-fill">`; `seniority-card.tsx` toma `accentTones[index]`; `distribution-card` y `capacity-bar` reciben `tone`.
- Contrastes medidos (fila blanca · lienzo #FAFAFB · seleccionada #FFF1F2 · fila oscura #17171B):
  - `#93C5FD` 1,80 · 1,73 · 1,64 · 9,91 → no sirve en claro.
  - `#0A8FD0` 3,59 · 3,44 · 3,27 · 4,98 ✓ (celeste que llega al piso; `#60A5FA` queda en 2,5).
  - `#2563EB` 5,17 · 4,95 · 4,70 · **3,46** ✓ · `#7C3AED` 5,70 · 5,46 · 5,19 · **3,14** ✓ · `#A21CAF` 6,32 · 6,06 · 5,76 · **2,83** ✗ en oscuro.
  - Oscuro: `#38BDF8` 8,34 · `#60A5FA` 7,03 · `#A78BFA` 6,57 · `#E879F9` 7,26 ✓.

## Goals / Non-Goals

**Goals:** escala celeste→azul→violeta→magenta, con nombres que dicen el matiz, verificada en los dos temas; un solo vocabulario para tokens, componentes, docs y consumidores.

**Non-Goals:** pasos `ink`/`surface`; tocar categórico o identidad; cambiar la anatomía de los componentes.

## Decisions

1. **Renombrar los matices**: `sky · blue · violet · magenta`. `blue` conserva el nombre porque sigue siendo azul. Se cambia `AccentTone`, `accentTones`, `accentScale`, los mapas de clases y las variables/clases derivadas (`--color-accent-sky-fill`, `bg-accent-sky-fill`). Alternativa descartada: conservar nombres con valores nuevos — `teal` pintando violeta rompe la promesa del vocabulario.

2. **Valores por tema en la capa de acento**: `AccentStops` pasa a `{ fill: string }` por tema — `accentColorsLight` y `accentColorsDark` (`AccentColorPalette` cada uno), exportados junto al par semántico; `accentColors` se mantiene como alias de claro para no romper imports internos. `generate-css.ts` saca el bloque de acento del grupo sin tema y lo emite dentro de los tres bloques temáticos, como el semántico. `tailwind-preset.ts` no cambia de forma (sigue apuntando a `var(--color-accent-<hue>-fill)`), sólo de nombres.

3. **Verificación por tema**: `buildAccentContrastChecks(colors, surfaces)` se llama dos veces — claro contra las tres superficies claras, oscuro contra la fila oscura — y `checkCssInSync` comprueba ambos bloques.

4. **Valores**: claro `sky #0A8FD0`, `blue #2563EB`, `violet #7C3AED`, `magenta #A21CAF` (los tres últimos tal cual se pidieron); oscuro `#38BDF8`, `#60A5FA`, `#A78BFA`, `#E879F9`. El celeste de referencia `#93C5FD` queda documentado en el comentario de `accent-colors.ts` como el matiz de partida que no alcanza 3:1.

5. **Componentes**: sólo renombran claves; `SeniorityCard` sigue indexando `accentTones`. Tests actualizan las clases esperadas. La skill (`dist/skill`) se regenera en el build.

6. **Docs**: `fundamentos.tsx` (vocabulario de acento: nombres, valores por tema, lectura de la escala), ejemplos de `level-meter`, `progress` (05/06), `capacity-bar`, `distribution-card/02-por-seniority`, y `switch.tsx` si menciona un tono.

## Risks / Trade-offs

- **Breaking** para la app: los usos de `slate`/`teal` en el frontend dejan de compilar hasta aplicar `adopt-accent-scale-rename` (mismo día, misma publicación del `.tgz`).
- `sky` en claro (`#0A8FD0`) no es el `#93C5FD` pedido: es el mismo matiz al nivel de contraste que el sistema exige. Si se prefiere el pálido, la alternativa es relajar la verificación para ese paso y darle un aro — descartada en la consulta.
- `sky` y `blue` son vecinos de matiz; el salto de luminancia (3,6:1 vs 5,2:1 sobre blanco) y el tono (cian vs índigo) los separan — comprobar en el medidor de cuatro segmentos al implementar.

## Migration Plan

1. Aplicar este change y publicar el `.tgz` a `.local-packages`.
2. Aplicar `adopt-accent-scale-rename` en el frontend (rename de tonos, reinstalar el paquete con `pnpm install --force`, limpiar `.vite`).
