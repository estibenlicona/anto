## Why

La escala de acento que viste los niveles de seniority (`slate · blue · teal · purple` → Principiante · Competente · Avanzado · Experto) se lee apagada y el primer paso gris no se percibe como "nivel" sino como "vacío". Se quiere una progresión más nítida y reconocible: celeste → azul → violeta → magenta, sobre la base de `#93C5FD · #2563EB · #7C3AED · #A21CAF`.

Dos cosas no se pueden tomar al pie de la letra: `#93C5FD` da 1,8:1 sobre la fila clara (el sistema exige 3:1 para un relleno gráfico y `verify-tokens` falla el build), y `#A21CAF` da 2,8:1 sobre la fila del tema oscuro. Por eso el primer paso se ajusta a un celeste que sí pasa y la escala gana, por primera vez, un valor por tema.

## What Changes

- **Nombres nuevos, por matiz**: `sky · blue · violet · magenta` reemplazan a `slate · blue · teal · purple` en `AccentTone`, `accentTones`, `accentColors`, las variables CSS (`--color-accent-sky-fill`…) y las clases (`bg-accent-sky-fill`…). Renombrar es deliberado: un token llamado `teal` que pinte violeta miente, y el vocabulario documenta que los nombres son matices.
- **Valores por tema** (`fill`):
  - claro: `sky #0A8FD0` · `blue #2563EB` · `violet #7C3AED` · `magenta #A21CAF`
  - oscuro: `sky #38BDF8` · `blue #60A5FA` · `violet #A78BFA` · `magenta #E879F9`

  Todos ≥ 3:1 contra las superficies que el sistema verifica (fila clara, lienzo, fila seleccionada; fila oscura para los de oscuro). El requisito "un mismo valor en los dos temas" se retira: era una conveniencia posible con la paleta anterior, no una propiedad del vocabulario.
- **Componentes**: `LevelMeter`, `SegmentedBar`/`Progress`, `SeniorityCard`, `DistributionCard`, `CapacityBar` y cualquier mapa `Record<AccentTone, …>` pasan a los nombres nuevos. El orden de la escala se mantiene (el índice 0 sigue siendo el primer nivel).
- **Verificación**: `verify-tokens` comprueba los cuatro matices en claro contra las tres superficies claras y los cuatro de oscuro contra la fila oscura; `generate-css` emite el bloque de acento dentro de cada tema.
- **Docs**: fundamentos (vocabulario de acento), ejemplos de level-meter, progress, capacity-bar y distribution-card.

### Fuera de alcance

- Pasos `ink`/`surface` por matiz (siguen sin consumidor).
- Cambios en la paleta categórica (`Tag`, `SegmentedBar color`) o en la de identidad.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `design-tokens`: "Vocabulario de acento sin significado de estado" — nombres de matices, valores por tema, escenario de progresión y de contraste.
- `component-library`: "Opciones del componente LevelMeter" y las piezas que reciben `tone` — el vocabulario de tonos es el nuevo.

## Impact

- `packages/tokens/src/{accent-colors.ts, tailwind-preset.ts, tokens.ts}`, `scripts/{generate-css.ts, verify-tokens.ts}`, CSS distribuido.
- `packages/components/src/{lib/accent-tone.ts, level-meter.tsx, progress.tsx, seniority-card.tsx, distribution-card.tsx, capacity-bar.tsx}` + tests; `dist/skill` regenerada.
- `apps/docs` (fundamentos, level-meter, progress, capacity-bar, distribution-card, switch si menciona tonos).
- **Breaking** para consumidores: el frontend referencia `slate`/`teal` en `PeopleStatsCards`, `SquadTeamStatsCards` y tests — lo adopta el change `adopt-accent-scale-rename` del repo de la app, que debe aplicarse junto con la publicación del `.tgz`.
