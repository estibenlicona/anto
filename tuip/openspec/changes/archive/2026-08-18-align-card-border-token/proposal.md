## Why

Card es el único contenedor del catálogo que no usa el trazo neutro estándar. Quince lugares dibujan su borde con `border.neutral.default`; Card quedó con `border.neutral.soft`, el trazo translúcido, como resultado de un cambio anterior que buscaba suavizar su contorno. Ese objetivo se cumplió, pero dejó a Card como excepción: quien mire una tabla, un input y una tarjeta en la misma pantalla está viendo tres bordes que deberían ser el mismo y uno que no lo es.

La diferencia entre los dos trazos es de todos modos despreciable. Compuesto sobre blanco, `soft` da `#E6E6E8` (1.25:1) y `default` es `#E3E3E6` (1.28:1) — entre ellos hay **1.03:1**, imperceptible. En oscuro la brecha es igual de chica: 1.51:1 contra 1.64:1. **Este cambio no se hace para que se vea distinto, y no se va a ver distinto.** Se hace para que Card deje de ser un caso aparte, y el costo de conseguirlo es cero.

## What Changes

- El contorno de `Card` pasa de `border.neutral.soft` a `border.neutral.default`.
- Las divisiones internas de `CardHeader` y `CardFooter` pasan al mismo token, porque el requisito vigente exige que sean consistentes con el contorno. Moverlo solo en el contorno dejaría a la tarjeta con dos trazos distintos y la pondría en incumplimiento.
- La sombra de Card no se toca: sigue siendo lo que comunica su elevación.
- `border.neutral.soft` no se retira. Lo sigue usando el botón `secondary`, donde su carácter translúcido tiene sentido: es un control en línea, no un contenedor.

## Capabilities

Ninguna. Este cambio declara `skip_specs: true`.

El requisito vigente `Límite y elevación de la superficie Card` pide "un trazo propio en su contorno" y que las divisiones internas usen "un trazo consistente con el del contorno", sin nombrar ningún token. Las dos condiciones se siguen cumpliendo después del cambio, así que no hay comportamiento declarado que cambie y no corresponde inventar un requisito para justificar el cambio.

## Impact

- `packages/components/src/card.tsx` — tres clases de borde.
- `apps/docs` — la anatomía de Card, si nombra el token.
- Toda pantalla del consumidor que use Card, aunque el cambio sea casi invisible. Requiere reconstruir y reempaquetar. No hay cambio de API.

## Lo que conviene tener presente al revisarlo

Si al ver el resultado esperabas un contorno más marcado, este cambio no lo da: son el mismo trazo a efectos prácticos. El token que sí produce un borde perceptible es `border.neutral.bold` (4.62:1 sobre blanco), que ya se probó en Card y se descartó por resultar demasiado pesado. Entre ese y el actual no hay ningún paso intermedio en la paleta.
