---
"@tuya-ui/components": minor
---

Dos opciones nuevas, las dos con el comportamiento actual como valor por defecto: **ningún consumidor cambia de aspecto**.

- **`Badge` acepta `dot={false}`.** El punto marca que lo que el badge dice es una *condición* —algo que está pasando y puede dejar de pasar—. Cuando el badge lleva una clasificación fija, como el nivel de una escala o la criticidad de algo, el punto no agrega información y compite con la etiqueta que ya la da. Omitirlo no cambia nada más: misma forma, misma variante, mismo relleno. El texto sigue teniendo que decirlo por sí solo, con punto o sin él.

- **Las partes de `CapacityBar` aceptan el vocabulario categórico.** Antes `tone: AccentTone` era obligatorio, con el argumento de que "las partes son pasos de un mismo todo". Cierto para lo que la barra mide, falso para lo que las partes son: BAU y Transformación son dos **categorías**, no dos pasos, y forzar el acento las hacía tomar prestados los mismos tonos que la escala de seniority, con la que se confundían. Ahora una parte declara `tone` o `color`, nunca los dos —mismo contrato que un segmento de `SegmentedBar`—, y la regla queda escrita: acento si las partes se ordenan entre sí, categórico si no.

El punto de la leyenda sale de la misma fuente que su tramo, así que no pueden quedar de colores distintos.
