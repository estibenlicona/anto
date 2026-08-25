## Decisions

1. `headline` va entre el rótulo y la barra y usa `text-metric`, el mismo tamaño que las demás cards de resumen: así una card con headline y una card métrica suelta alinean sus cifras.
2. `action` reemplaza al total en la cabecera en vez de convivir con él: dos cosas a la derecha del rótulo compiten; si hay adónde ir, el total ya lo dice el headline.
3. `legend="inline"` no usa `flex-1` en la etiqueta (la cifra va pegada) y baja a `text-label` porque es pie de barra, no dato principal.
