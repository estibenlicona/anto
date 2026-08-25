---
"@tuya-ui/components": minor
"@tuya-ui/tokens": minor
---

`Table` suma las tres piezas que faltaban para una matriz de habilidades:

- **Densidad `matrix`**: el paso más ajustado de los tres, para la tabla cuya celda lleva un medidor o una cifra de un dígito. Baja también en horizontal, que es su razón de ser: el aire pensado para leer texto separa tanto las columnas que se pierde la comparación entre filas.
- **`stickyFirstColumn`**: ancla la primera celda de cada fila —cuerpo, cabecera y pie— mientras el resto se desplaza, con el fondo opaco que ya tiene su sección. La separación del borde derecho aparece sólo cuando hay contenido oculto hacia la izquierda, para que signifique "acá empieza lo congelado" y no una divisoria más. Requiere que ningún ancestro recorte con `overflow: hidden`.
- **Fila con detalle**: `TableRow` acepta `detail`, `expanded` y `onExpandedChange`. El detalle se renderiza como una `<tr>` propia con una `<td colSpan>` calculada desde las celdas de la fila, así que la semántica nativa queda intacta. El control vive dentro de la primera celda —no en una columna nueva, que le quitaría el lugar a la columna de identidad— y la apertura es del consumidor: el componente no cierra ninguna fila por su cuenta.
- **Token `shadow.edge`**: la sombra de esa costura. Es el único paso de la familia que no se lee como luz desde arriba, porque no es elevación sino el canto de una columna congelada proyectado de lado; misma receta que `shadow.sm`, girada al eje horizontal, para que las dos no parezcan materiales distintos.
