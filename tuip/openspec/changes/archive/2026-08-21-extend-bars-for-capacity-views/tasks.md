## 1. Token `bg-brand-strong`

- [x] 1.1 En `packages/tokens/src/semantic-colors.ts`, agregar `strong` a `BrandBackground` con docstring, y asignar `p.brand[300]` en light y `p.brand[700]` en dark.
- [x] 1.2 En `packages/tokens/scripts/verify-tokens.ts`, registrar el par `background.brand.strong` sobre `background.neutral.default` como informativo (sin assertion) con el comentario de por qué no aplica el piso 3:1.
- [x] 1.3 Build de tokens y confirmar que `tokens.css` expone `--color-bg-brand-strong` en ambos temas y que el preset genera `bg-brand-strong`.

## 2. SegmentedBar

- [x] 2.1 En `progress.tsx`, agregar el tipo `SegmentedBarHeat`, la cuarta rama `heat` de `SegmentedBarSegment` (excluyente con `role`/`color`/`tone`) y `heatClasses` (danger-bold / brand-bold / brand-strong / neutral-subtle-pressed); exportar el tipo.
- [x] 2.2 Agregar `total?: number`: denominador `max(total, Σ)`, track `bg-neutral-subtle` en el contenedor cuando `total` está definido.
- [x] 2.3 Agregar `size?: "sm" | "md"` (`h-1.5` / `h-2`, default `md`).
- [x] 2.4 Tests en `segmented-bar.test.tsx`: clases de `heat` por grado; `total` mayor que la suma deja anchos sobre el total y track visible; `total` menor que la suma usa la suma; `size="sm"` aplica `h-1.5`; los usos con `role`/`color`/`tone` sin `total` no cambian.

## 3. Progress

- [x] 3.1 En `progress.tsx`, agregar `warningFrom?: number` (clamp 0–100) y la cadena de relleno: brand → danger (>100) → warning (≥ umbral) → success.
- [x] 3.2 Crear `progress.test.tsx`: sin umbral (99/100/101), `warningFrom={100}` (99/100/101), `warningFrom={85}` (84/85/99/100), y que `brandFill` ignora el umbral.

## 4. Componentes compuestos

- [x] 4.1 Extraer `severityFor(value, warningFrom)` a `lib/severity.ts` y exportar `segmentFillClass(segment)` desde `progress.tsx`; usarlos en `Progress`/`SegmentedBar`.
- [x] 4.2 Crear `meter.tsx` (`Meter`: Progress + cifra, `warningFrom`, `minWidth`) y `meter.test.tsx` (0, 80, 100 con umbral 100, 120).
- [x] 4.3 Crear `capacity-bar.tsx` (`CapacityBar`: cabecera, % por severidad, SegmentedBar `size="sm"` con `total`, leyenda, libre/tope, variante vacía, textos configurables) y `capacity-bar.test.tsx` (escenarios 1.8/2.0, tope, con espacio, vacía, disponible en cero).
- [x] 4.4 Crear `distribution-card.tsx` (`DistributionCard`: Card + cabecera + SegmentedBar + leyenda 2 columnas + pie opcional; segmentos en cero sólo en leyenda; punto `heat: low` con borde) y `distribution-card.test.tsx`.
- [x] 4.5 Exportar los tres desde `index.ts`; confirmar que el build los suma al registry y al skill.

## 5. Documentación y publicación

- [x] 5.1 En `apps/docs/src/content/progress.tsx`, documentar `total`, `heat` (con la regla de cuándo frente a `role`/`tone`), `size` y `warningFrom`.
- [x] 5.2 Crear las páginas de docs `capacity-bar.tsx`, `distribution-card.tsx` y `meter.tsx` con los ejemplos de capacidad por célula, distribución por criticidad y utilización.
- [x] 5.3 Correr `pnpm test` y `pnpm build` en el monorepo (tokens, components, docs, registry y skill regenerados) sin regresiones.
- [x] 5.4 `pnpm run publish:local` para que la app pueda adoptar las opciones en su propio change.
