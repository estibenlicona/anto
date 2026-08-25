---
"@tuya-ui/tokens": minor
"@tuya-ui/components": minor
---

El tercer matiz de la escala de acento pasa de turquesa a ocre dorado, y `SegmentedBar` gana el vocabulario de acento.

**`@tuya-ui/tokens`**

- **El matiz `teal` (`#2E97A3`) se reemplaza por `gold` (`#AD7A0B`)**, un ocre dorado. No es un pastel a propósito: un amarillo pastel ronda 1.3:1 contra la fila clara y la verificación automática lo rechaza; éste es el dorado más claro que supera el piso de 3:1 con margen en las cuatro superficies (fila clara 3.77, lienzo 3.62, fila seleccionada 3.43, fila oscura 4.74).
- **Cambio visual en cascada**: todo lo que consume la escala cambia el color de su tercer paso — "Avanzado" en seniority incluido — con la sola actualización del paquete.
- **BREAKING para consumo directo**: `--color-accent-teal-fill` y `bg-accent-teal-fill` dejan de existir; sus reemplazos son `--color-accent-gold-fill` y `bg-accent-gold-fill`. Dentro de los dos paquetes no queda ninguna referencia a `teal` de acento; el matiz `teal` de la paleta de **identidad** (avatares) no tiene relación y no cambia.
- `gold` no es un alias del `warning` semántico, igual que `slate` no lo es de `neutral` ni `blue` de `info`: un dorado en el tercer paso de un medidor no advierte nada. La documentación de fundamentos lo dice explícitamente.

**`@tuya-ui/components`**

- **`AccentTone` pasa de `"teal"` a `"gold"`** en el tipo y en la lista ordenada `accentTones` (**BREAKING** para quien escriba `tone="teal"`). `LevelMeter` y `SeniorityCard` no cambian de API: sólo su tercer paso cambia de color.
- **`SegmentedBar` acepta `tone` en sus segmentos** (aditivo): un tercer vocabulario de color junto a `role` y `color`, excluyentes entre sí por segmento. Es el mismo vocabulario ordinal de cuatro matices que usa `LevelMeter`, con la misma clase de relleno — para que una distribución por nivel vista los mismos colores que el medidor de ese nivel en cualquier otra pantalla. Cuándo usar cada uno: `role` cuando el color afirma estado, `color` cuando sólo distingue categorías sin orden, `tone` cuando los segmentos son pasos de una escala ordinal.

**Actualizar cambia un color a la vista**: si tu pantalla muestra la escala de acento, su tercer paso pasa de turquesa a dorado sin que toques código. Ninguna API cambia salvo el nombre del matiz.
