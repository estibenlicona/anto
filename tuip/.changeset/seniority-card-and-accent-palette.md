---
"@tuya-ui/components": minor
"@tuya-ui/tokens": minor
---

Pieza de seniority, medidor de nivel y paleta de acento.

**`@tuya-ui/tokens`**

- Nueva familia de color `accent` con cuatro matices ordenados (`slate`, `blue`, `teal`, `purple`) y **un paso cada uno**: `fill`, previsto para teñir elementos gráficos y no texto. Es un vocabulario propio, aparte del semántico: distingue los pasos de una escala ordinal y **no comunica estado** — no reemplaza a `success`, `warning`, `danger` ni `info`. Se distribuye bajo su propio prefijo (`--color-accent-<matiz>-fill`) y como utilidades de fondo de Tailwind (`bg-accent-blue-fill`).
- **Independiente del tema**: un mismo valor por matiz sirve en claro y en oscuro, porque supera el mínimo de 3:1 contra las cuatro superficies del sistema sobre las que puede quedar apoyado. No hay asignación por tema ni derivación.
- Nueva capa de token de componente con las medidas fijas de la pieza de seniority.
- La verificación de contraste ahora cubre los vocabularios no semánticos, y a un paso sin superficie propia lo mide contra **todas** las superficies que puede tocar, no sólo contra una.

**Actualizar es seguro**: la adición es puramente aditiva. Ningún token existente cambia de valor ni de nombre, así que subir la versión no mueve nada de lo que ya se consume.

**`@tuya-ui/components`**

- **`SeniorityCard`** (nuevo, beta): el nivel de seniority de una persona como bloque de medida fija con la etiqueta del nivel y un medidor de cuatro segmentos teñido según la posición en la escala. Escala cerrada de cuatro; un valor fuera de ella —o `null`— renderiza el estado vacío documentado, con la misma dimensión. Admite densidad compacta para filas de tabla y una variante de ancho reducido que mueve el nombre del nivel al nombre accesible y al tooltip.

  **No dibuja fondo, borde ni sombra**: pese al nombre, no es una superficie — se apoya en lo que la contenga. Su etiqueta va en texto neutro en los cuatro niveles; el matiz vive únicamente en el medidor.

- **`LevelMeter`** (nuevo, beta): el medidor de segmentos como pieza propia, reutilizable en cualquier escala ordinal cerrada. `steps` es 4 por defecto. No confundir con `SegmentedBar`, que reparte proporciones de un total.
- **`Card` no cambia.**
- El código de los componentes ahora se verifica automáticamente contra colores literales: un hexadecimal donde existe token equivalente falla el build.
