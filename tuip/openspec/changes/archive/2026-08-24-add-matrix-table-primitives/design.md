## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- `Table` ya envuelve la tabla en un contenedor con `overflow-x-auto`: el desplazamiento existe, falta anclar la columna.
- La densidad viaja hoy por contexto de React (`DensityContext`) desde `Table` hasta `TableHead` y `TableCell`, con dos mapas de padding. El paso nuevo se suma a esos mapas.
- `modernize-table-suite`, sin archivar, ya toca el mismo requisito de densidad y los fondos de cabecera/pie/cuerpo. Este change parte de ese texto, no del que hoy está en la spec principal.
- El catálogo no tiene ningún componente que abra contenido dentro de una tabla; `Accordion` existe pero envuelve secciones sueltas, no filas.

## Goals / Non-Goals

**Goals:**

- Que una matriz de decenas de columnas se lea sin perder de vista de quién es cada fila.
- Que el detalle de una fila viva dentro de la tabla, sin romper su semántica.

**Non-Goals:**

- Cabecera fija en vertical, o fijar una columna que no sea la primera.
- Virtualización: si la matriz llega a un tamaño donde el DOM pesa, se resuelve paginando en la app, no acá.
- El componente "matriz": la app compone estas piezas.

## Decisions

- **La columna fija se implementa con `position: sticky` en las celdas, no en un `<colgroup>` ni con una tabla espejo.** `sticky` sobre `th`/`td` es la única técnica que conserva un solo `<table>` — y por lo tanto la semántica que el requisito de estructura exige. Alternativa considerada: dos tablas sincronizadas por scroll (la técnica clásica). Se descarta: duplica el marcado, desincroniza alturas de fila apenas el contenido varía, y le entrega a las tecnologías de asistencia dos tablas donde hay una.
- **Fondo opaco obligatorio en la celda fija.** Una celda `sticky` sin fondo deja pasar el contenido por debajo. Se toma el fondo que ya tiene su sección (`bg-neutral-default` en el cuerpo, `bg-neutral-subtlest` en cabecera y pie, tras `modernize-table-suite`), así la columna fija no introduce un color propio.
- **La separación de la columna fija aparece con el scroll, no siempre.** Es la diferencia entre "hay algo escondido" y "acá hay una línea": dibujarla siempre convierte el borde en decoración y pierde su significado. Se resuelve escuchando el desplazamiento del contenedor y alternando una sombra lateral (`shadow.sm`) en el borde derecho de la columna.
- **El detalle es una `<tr>` con una `<td colSpan>`.** Es la forma nativa de asociar contenido a una fila; cualquier alternativa (un `div` posicionado, un segundo `tbody`) rompe la grilla o la semántica. El control de apertura vive en la primera celda de la fila, antes de su contenido, y lleva `aria-expanded` más `aria-controls` apuntando a la fila de detalle.
- **La apertura es controlada.** Quién está abierto es estado de la pantalla —la app puede querer abrir una fila al llegar desde otro lugar—, así que el componente recibe `expanded` y `onExpandedChange` y no guarda estado propio. Alternativa considerada: no controlada con `defaultExpanded`. Se descarta: la primera pantalla que la consume necesita abrir la fila que trae la URL.
- **`matrix` es una densidad y no un componente.** Lo único que cambia respecto de `compact` es el padding; inventar un `MatrixTable` duplicaría cabecera, cuerpo, orden y alineación para cambiar dos números.

## Risks / Trade-offs

- **[`position: sticky` en celdas depende de que ningún ancestro recorte con `overflow: hidden`]** → El contenedor propio de `Table` usa `overflow-x-auto`, que es compatible; queda documentado que envolver la tabla en un contenedor con `overflow: hidden` anula la columna fija, que es el error clásico de esta técnica.
- **[La sombra al desplazar exige escuchar el scroll]** → Un único listener pasivo en el contenedor de la tabla, con el estado en un `data-` attribute; sin librerías ni medición por fila.
- **[La fila de detalle hereda el `colSpan` total]** → Si el consumidor cambia la cantidad de columnas, el `colSpan` tiene que acompañar. Se calcula contando las celdas de la fila que lo abre, no pidiéndoselo al consumidor.

## Migration Plan

1. `table.tsx`: densidad `matrix` en los dos mapas de padding; columna fija con `sticky` y la sombra por scroll; fila con detalle.
2. Pruebas del componente (semántica del detalle, `aria-expanded`, la sombra que aparece y desaparece, el padding de `matrix` por debajo de `compact`).
3. Docs: ejemplo de matriz con columna fija y ejemplo de fila con detalle.
4. Changeset `minor`, build, `pnpm pack` — la app lo consume en su propio change.

Rollback: los tres agregados son opt-in; quitarlos deja `Table` como está hoy.
