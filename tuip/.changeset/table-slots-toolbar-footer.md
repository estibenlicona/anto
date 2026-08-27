---
"@tuya-ui/components": minor
---

`Table` acepta dos slots nuevos, `toolbar` y `footer`, y dibuja una sola card alrededor de barra, tabla y pie.

`toolbar` va encima de la cabecera y `footer` debajo del cuerpo; los dos reciben cualquier contenido (`SearchField`, `FilterButton`, acciones, `PaginationBar`…) y Table no lo interpreta. Con contenido en al menos uno, el borde y las esquinas pasan a un marco que envuelve las tres zonas, con una línea entre cada slot y la tabla; los slots quedan fuera del desplazamiento horizontal, así que no se mueven con las columnas ni recortan sus popovers. `flush` sigue aplicando al marco completo, y `stickyFirstColumn` funciona igual con o sin slots.

Sin slots no cambia nada: el marco arranca en la cabecera, como hasta ahora. Es la forma recomendada de componer búsqueda, filtros y paginación a partir de esta versión — ya no hace falta envolver `Table`, los filtros y la paginación en una card propia (que además necesitaba `overflow-hidden`, lo que anula la columna fija). El ejemplo "Integración completa" del catálogo muestra la composición.
