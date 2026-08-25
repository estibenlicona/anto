## Why

El resumen de Personas quedó desbalanceado tras el rediseño de la card de distribución: esa card creció en alto (filas con descriptor en dos líneas, eje, pie) y la grilla estira las tres cards a la altura de la más alta, así que "Personas activas" y "FTE disponible" muestran más vacío que contenido. La franja entera ocupa espacio vertical que empuja el listado — que es lo que el Chapter Lead vino a ver — fuera del primer golpe de vista.

El usuario eligió la estrategia explícitamente entre tres: **densificar las tres cards conservando toda la información** — ni quitar el eje ni reorganizar la grilla.

## What Changes

- **La card de distribución aprieta su interior sin perder nada**: nombre y descriptor pasan a una sola línea por fila ("Principiante · con acompañamiento", con el descriptor en tratamiento sutil y truncado si no entra, llevando el texto completo en `title`), las barras se afinan, el aire entre filas se reduce, y el eje y el pie se acercan a su contenido. El alto de la card baja en el orden del 35–40%.
- **Las otras dos cards acompañan**: su espaciado interno se reduce para que, con la fila más baja, no quede vacío visible. Su contenido (métrica grande, avatares, barra de progreso) no cambia.
- **Nada de información desaparece**: descriptores, porcentajes, conteos, eje con sus marcas y las dos lecturas del pie siguen todos presentes. Es un cambio de densidad, no de contenido.

### Fuera de alcance

- Reorganizar la grilla del resumen (columnas, apilados) — estrategia descartada por el usuario.
- Quitar el eje o el pie — estrategia descartada por el usuario.
- El listado, la toolbar y cualquier otra parte de la pantalla.
- `tuip`: no se toca el sistema de diseño; todo es composición local de la card.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — este change declara `skip_specs`. El requisito "Resumen del módulo de Personas" describe qué muestra cada fila —nombre, descriptor, barra, porcentaje, conteo, eje, lecturas del pie— y todo eso se conserva idéntico; que el nombre y el descriptor compartan línea o que la barra sea más fina es densidad de presentación, por debajo de la altitud del spec. Si el spec fijara densidades, cada ajuste visual sería un delta.)

## Impact

- **Card**: `frontend/src/features/people/components/PeopleStatsCards.tsx` — espaciados, tamaños y la composición de la etiqueta de fila. Sin cambios de datos ni de cálculo.
- **Pruebas**: `PeopleStatsCards.test.tsx` asserta textos, clases de acento y anchos inline — todo sobrevive al cambio de densidad; se revisa que ninguna query dependa de la estructura de dos líneas.
- **Sin impacto**: backend, mocks, catálogos, `tuip`, el listado y las demás pantallas.
- **Restricción conocida**: la app no compila Tailwind y `CardBody` une clases por concatenación simple (sin tailwind-merge), así que su padding no se pisa con otra clase de forma confiable — las medidas propias van por estilo inline, como ya hace la card.
