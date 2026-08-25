## 1. Densidad de matriz

- [x] 1.1 Verificado: `modernize-table-suite` está aplicado en código (39/39 tareas: la cabecera ya tiene su propio padding y los fondos de cabecera/pie/cuerpo ya son los nuevos) pero **sin archivar**. La base de código existe, así que se implementa; **al archivar hay que respetar el orden: modernize-table-suite → add-matrix-table-primitives.**
- [x] 1.2 Agregar el paso `matrix` a los mapas de padding de cuerpo y cabecera de `table.tsx`, por debajo de `compact` en ambos ejes, y exponerlo en el tipo de densidad.
- [x] 1.3 Prueba: con `density="matrix"` el padding de celda queda por debajo del de `compact`, y la cabecera sigue siendo más baja que el cuerpo.

## 2. Columna de identidad fija

- [x] 2.1 Agregar a `Table` la opción de primera columna fija: `sticky` en la primera celda de cada fila (cuerpo, cabecera y pie), con el fondo opaco que ya usa cada sección.
- [x] 2.2 Alternar la separación del borde derecho según el desplazamiento del contenedor: un listener pasivo que marca el estado en el contenedor, y la sombra que se dibuja sólo cuando hay contenido oculto a la izquierda.
- [x] 2.3 Pruebas: la primera columna queda fija y con fondo propio; sin desplazamiento no hay separación y al desplazar aparece; una tabla sin la opción no cambia en nada.
- [x] 2.4 Documentar la restricción de `overflow: hidden` en un ancestro, que anula la columna fija.

## 3. Fila con detalle desplegable

- [x] 3.1 Extender `TableRow` para aceptar el detalle: control de apertura en la primera celda con `aria-expanded` y `aria-controls`, y el detalle como `<tr>` con `<td colSpan>` calculado desde las celdas de la fila.
- [x] 3.2 Apertura controlada (`expanded` + `onExpandedChange`), sin cerrar otras filas por su cuenta; una tabla sin filas desplegables no reserva la columna del control.
- [x] 3.3 Pruebas: abrir y cerrar desde teclado y mouse, dos filas abiertas a la vez, la estructura de tabla intacta con el detalle abierto, y la tabla sin detalles sin columna extra.

## 4. Publicación

- [x] 4.1 Docs: ejemplo de matriz (columna fija + densidad `matrix`) y ejemplo de fila con detalle en la referencia de `Table`.
- [x] 4.2 Changeset `minor` describiendo los tres agregados.
- [x] 4.3 Correr las pruebas del paquete y el build; verificar que las clases nuevas quedan en el CSS construido.
- [x] 4.4 Empacar el `.tgz` en `.local-packages` para que la app pueda consumirlo en su propio change.
