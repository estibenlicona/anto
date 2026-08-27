## Why

En Competencias, el filtro de habilidades (Todas / Técnicas / Humanas) vive en la columna del mapa, encima de la tabla, mientras la columna de apoyo arranca desde arriba: las cards quedan una fila más altas que el mapa y la zona se ve desnivelada. De las tres direcciones propuestas en el lienzo "Alineación del mapa de competencias", el usuario eligió la **B**: el filtro entra en la card del mapa como su barra superior, con el slot `toolbar` que `Table` ya tiene desde `table-slots-toolbar-footer`. El marco del mapa arranca a la altura de las cards y el filtro queda pegado a las columnas que recorta, con la misma anatomía que los listados (barra dentro de la card).

## What Changes

- `SpanMatrixTable` acepta un slot `toolbar` y lo pasa a `Table`; el contenedor le entrega ahí el filtro de habilidades en vez de renderizarlo como fila suelta encima.
- La card del mapa pasa a ser: barra con el filtro → cabeceras → filas, en un solo marco. La fila de notas (pendientes + contador) se queda como está, encima de las dos zonas.
- Mapa y columna de apoyo arrancan en la misma línea.
- Corrección de forma hecha directamente en `openspec/specs/span-matrix-view/spec.md` (no vía delta, porque un MODIFIED no puede mover escenarios entre requisitos): dos escenarios del contador ("Una sola brecha", "Sin matriz") estaban bajo el requisito del filtro y vuelven al de la fila de notas. Sin cambio de comportamiento.

- Ajuste posterior a la revisión: todos los gaps de la pantalla de Competencias pasan a `gap-3` (12px) — grid de cards de resumen, raíz, fila de notas, mapa ↔ columna de apoyo y rejilla de la columna — y la franja del breadcrumb y el `<main>` del shell pasan de `py-2` a `py-3`. Lo segundo afecta a todas las pantallas del lead (es del layout): el paso de 12px queda uniforme entre franja y contenido.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `span-matrix-view`: el requisito "El filtro de habilidades va pegado al mapa y el orden es fijo por brechas" pasa a exigir el filtro dentro de la card del mapa, alineada con la columna de apoyo; el requisito "La vista usa un espaciado vertical compacto" pasa de 8px a un paso uniforme de 12px en toda la pantalla.
- `lead-shell-page-actions`: el requisito "La franja y el contenido usan padding vertical corto" pasa de 8px a 12px por lado (24px entre breadcrumb y contenido).

## Impact

- `src/features/career-plan/components/SpanMatrixTable.tsx`: prop `toolbar?: ReactNode` → `Table toolbar`.
- `src/features/career-plan/SpanMatrixContainer.tsx`: `SpanControls` deja la columna del mapa y entra por `toolbar`.
- `SpanControls.tsx` no cambia (su wrapper flex ya encaja en la barra).
- Tests: `SpanMatrixContainer.test.tsx` — los asserts que localizan el filtro en la columna del mapa pasan a localizarlo dentro del marco de `Table`; la prueba de la leyenda ajusta su comentario.
- Sin cambios en tuip: el slot ya existe y está probado con `stickyFirstColumn`.
