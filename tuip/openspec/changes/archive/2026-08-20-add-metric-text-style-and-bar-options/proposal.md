## Why

Al construir las cards de resumen de la pantalla de Personas (en el repo de la app) contra su mockup de referencia, aparecieron tres cosas que el sistema no puede expresar hoy:

1. **No hay un estilo tipográfico para cifras.** El requisito "Escala tipográfica del sistema" afirma que la escala cubre "el título de pantalla, los títulos de sección y de tarjeta, el cuerpo, el cuerpo pequeño, la etiqueta y **las cifras**", pero `textStyle` no define ningún estilo de cifra: lo único que existe es `numeric`, que solo aporta `tabular-nums`, sin tamaño ni peso. Quien necesita mostrar una cifra dominante termina usando `display`, que está documentado como "título de pantalla, uno por vista, arriba a la izquierda" — un rol distinto. Es un hueco entre lo que el spec ya declara y lo que la escala define.
2. **`SegmentedBar` no puede separar sus segmentos.** Pinta una barra continua dentro de un único contenedor redondeado. Cuando los segmentos representan categorías independientes (no tramos de un mismo continuo), leerlos pegados sugiere una continuidad que no existe.
3. **`Progress` no admite un relleno de marca.** Su color codifica severidad (verde dentro de rango, `danger` al pasarse), que es lo correcto para capacidad; pero en un tablero donde la barra es decorativa y no una alerta, no hay forma de pedir un relleno de marca.

## What Changes

- **Escala tipográfica**: se agrega el estilo `metric` — la cifra dominante de un indicador. Completa el rol de "cifras" que el requisito ya declaraba y que la escala nunca definió. La escala sigue cerrada: no se abre a tamaños arbitrarios, gana un rol con nombre. El estilo trae consigo un peso `bold` (700), cuarto del conjunto, para que la cifra no comparta peso con los títulos que la rodean.
- **Token de degradado de marca**: nuevo token de degradado derivado de la paleta primitiva de marca (no de hexadecimales sueltos), para que el relleno de `Progress` no hardcodee color.
- **`SegmentedBar`**: nueva opción para separar los segmentos entre sí, redondeando cada uno por separado. Por defecto sigue pintando la barra continua de hoy — ningún consumidor actual cambia.
- **`Progress`**: nueva opción para rellenar con el degradado de marca en vez del color de severidad. Es **opt-in**: por defecto conserva el comportamiento actual (verde dentro de rango, `danger` sobre 100), así que ningún consumidor actual cambia de significado.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `design-tokens`: el requisito "Escala tipográfica del sistema" gana el estilo de cifra que su propio texto ya declaraba cubrir; se agrega además un token de degradado de marca derivado de la paleta primitiva.
- `component-library`: los requisitos de `SegmentedBar` y `Progress` ganan, cada uno, una opción de presentación que hoy no existe.

## Impact

- `packages/tokens/src/typography.ts`: nuevo estilo en `textStyle` y nuevo peso en `fontWeight`.
- `packages/tokens/src/` (color/degradado): nuevo token de degradado de marca.
- `packages/tokens/src/tailwind-preset.ts`: exponer ambos como utilidades.
- `packages/components/src/progress.tsx`: `SegmentedBar` (separación de segmentos) y `Progress` (relleno de marca).
- `apps/docs`: ejemplos y documentación de las opciones nuevas; página de fundamentos de tipografía.
- Sin cambios de comportamiento para consumidores actuales: las dos opciones de componente son opt-in y el estilo tipográfico es aditivo.
- Desbloquea, en el repo de la app, el grupo de tareas de fidelidad con el mockup del change `add-people-dashboard-cards`.
