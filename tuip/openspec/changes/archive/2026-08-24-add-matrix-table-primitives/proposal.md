## Why

El diseño aprobado del plan de carrera (canvas "Plan de Carrera del Chapter") apoya su pantalla principal en una matriz de personas × habilidades: una fila por persona, una columna por habilidad y una celda por nivel evaluado. Con el span real —decenas de personas y una decena de habilidades— esa tabla no entra a lo ancho, y al desplazarla se pierde de vista la columna que dice de quién es cada fila: una celda sin nombre no significa nada. El segundo apoyo es el perfil individual, donde cada habilidad se abre para mostrar sus criterios cumplidos y pendientes.

`Table` hoy resuelve el desplazamiento horizontal (el contenedor ya es `overflow-x-auto`) pero no fija ninguna columna, y no tiene forma de asociar a una fila un bloque de detalle que se abra debajo. Las dos son piezas de tabla, no de pantalla: componerlas a mano en la app implicaría duplicar el `table` nativo con divs y perder la semántica que el propio requisito de `Table` exige.

## What Changes

- **Columna de identidad fija**: `Table` acepta que su primera columna quede anclada mientras el resto se desplaza horizontalmente. La columna fija dibuja una separación propia cuando hay contenido oculto a su izquierda, para que se lea como borde de la zona congelada y no como una línea más de la grilla.
- **Fila con detalle desplegable**: `TableRow` acepta ser expandible — un control de apertura al inicio de la fila y un bloque de detalle que se renderiza como una fila propia debajo, ocupando todo el ancho, con la semántica de tabla intacta y el estado anunciado a tecnologías de asistencia.
- **Densidad `matrix`**: un tercer paso de densidad por debajo de `compact`, para las celdas de una matriz donde el contenido es un medidor y un número corto, no texto.

### Fuera de alcance

- Fijar columnas que no sean la primera, o fijar la cabecera al desplazar verticalmente.
- Selección múltiple de filas, agrupación o virtualización.
- El componente de matriz completo: la matriz es composición de la app sobre estas piezas, no un componente del catálogo.

## Capabilities

### Modified Capabilities

- `component-library`: `Table` gana la columna de identidad fija y la densidad `matrix`, y `TableRow` gana el detalle desplegable.

## Impact

- `packages/components/src/table.tsx` y su archivo de pruebas; sin tokens nuevos —la separación de la columna fija usa `border.neutral.default` y la sombra `shadow.sm`, ambos existentes.
- `apps/docs`: referencia y ejemplos de `Table` (matriz con columna fija, fila con detalle).
- Changeset `minor`: los tres agregados son aditivos y ninguna tabla existente cambia de aspecto sin pedirlo.
- **Orden**: `modernize-table-suite` está sin archivar y también modifica requisitos de `Table` (fondo de cabecera, pie y cuerpo). Debe archivarse antes que este change, o el bloque MODIFIED de acá no encuentra su anclaje.
