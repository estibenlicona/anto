## Why

El usuario entregó una card de referencia para la distribución por seniority y pidió volver al turquesa para "Avanzado", "pero en esta tonalidad" — la de la imagen. Muestreados los píxeles de la referencia, las cuatro barras son **exactamente la paleta de acento original**: `#8B8B93`, `#3B7ACB`, `#2E97A3` y `#8A63D2`. La tonalidad pedida es el turquesa original, píxel por píxel.

O sea: el swap a dorado (`swap-accent-teal-for-gold`, archivado hoy) se revierte. El dorado duró una iteración de diseño; la referencia nueva vuelve al turquesa, y este change deja la paleta como la referencia la muestra. El costo del ida y vuelta es bajo a propósito — el rename está contenido en tres archivos de fuente más docs — y el historial de ambos changes documenta por qué existió cada estado.

## What Changes

- **El tercer matiz vuelve a ser `teal` con su valor original `#2E97A3`.** Cambian el nombre y el valor: `gold` (`#AD7A0B`) desaparece. El valor ya está verificado contra el piso de contraste (fila clara 3.46, lienzo 3.32, fila seleccionada 3.15, fila oscura 5.17 — todos ≥ 3:1); no hay tonalidad que afinar porque la referencia fija el hex exacto.
- **BREAKING** para consumo directo del nombre: `bg-accent-gold-fill`, `--color-accent-gold-fill` y `tone="gold"` dejan de existir; vuelven `bg-accent-teal-fill`, `--color-accent-teal-fill` y `tone="teal"`. Hay un consumidor conocido: la card de distribución de la aplicación de gestión de capacidad, que usa `gold` en su mapeo y su leyenda — su change companion (`redesign-seniority-distribution-card`) hace el rename de su lado.
- **`SegmentedBar` conserva el vocabulario de acento** (la rama `tone` agregada en el change anterior); sólo cambia el nombre del tercer miembro. `LevelMeter` y `SeniorityCard` no cambian de API: su tercer paso vuelve a verse turquesa.
- La nota de "gold no es alias de warning" en tokens y fundamentos se retira: con el turquesa el parentesco semántico riesgoso desaparece, y la advertencia general (el acento no comunica estado) ya cubre el resto.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `design-tokens`: el requisito de la paleta de acento vuelve a nombrar sus matices `slate`, `blue`, `teal`, `purple`, con la progresión gris → azul → turquesa → morado y el escenario de contraste del tercer matiz en su forma turquesa. Viaja como REMOVED ("Paleta de acento sin significado de estado") + ADDED ("Vocabulario de acento sin significado de estado"): el escenario del dorado tiene que morir con su matiz, y el validador sólo permite retirar escenarios retirando el requisito que los contiene — el nombre nuevo es el costo de esa regla, documentado en el propio delta.
- `component-library`: "Opciones del componente SegmentedBar" actualiza los nombres del vocabulario de acento en su escenario de tono, y "Opciones del componente SeniorityCard" vuelve a describir la progresión con turquesa (MODIFIED ambos).

## Impact

- **Tokens**: `packages/tokens/src/accent-colors.ts` — matiz, valor, tabla de contraste del encabezado (los valores del turquesa original ya están medidos) y la nota de `warning`. Preset, CSS y verificación absorben el rename solos.
- **Componentes**: `lib/accent-tone.ts`, `level-meter.tsx`, `progress.tsx` (mapa de la rama `tone`) — rename en los tres. `seniority-card.tsx` sin cambios.
- **Pruebas**: las que nombran `gold` (`level-meter.test.tsx`, `seniority-card.test.tsx`, `segmented-bar.test.tsx`) vuelven a `teal`.
- **Docs**: fundamentos (prosa de la nota de warning), `content/level-meter.tsx` y sus ejemplos, ejemplos de `progress` que usan `tone="gold"`. Swatches y tablas derivan de la paleta y se regeneran solos.
- **Distribución**: changeset `MINOR` de ambos paquetes con la nota del revert y el BREAKING del rename; registry y Skill regenerados; `pnpm run publish:local`.
- **Consumidor a la espera**: `redesign-seniority-distribution-card` en el repo de la app.
