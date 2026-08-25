## 1. Card de distribución

- [x] 1.1 En `PeopleStatsCards.tsx`, pasar la etiqueta de fila a una línea: nombre (`text-body-sm font-semibold`) + "·" + descriptor (`text-label` neutralizado, tono sutil), con `truncate` y el texto completo en `title`.
- [x] 1.2 Ampliar la columna de etiquetas de la plantilla compartida a `minmax(0, 11rem)` y confirmar que el eje sigue alineado bajo las barras (usa la misma plantilla).
- [x] 1.3 Bajar el alto de barra a `0.625rem` (inline), la separación entre filas a `gap-1.5`, el `gap` general de la card a `gap-2`, y la respiración del pie a `paddingTop: 0.5rem` inline.

## 2. Las otras dos cards

- [x] 2.1 Reducir el `gap-3` interno de "Personas activas" y "FTE disponible" a `gap-2`, sin tocar su contenido ni sus tamaños de texto.
- [x] 2.2 Confirmar que con la fila más baja las tres cards quedan parejas y sin vacíos dominantes.

## 3. Pruebas y verificación

- [x] 3.1 Correr `npx vitest run src/features/people`: las aserciones de textos, clases de acento y anchos inline deben sobrevivir sin cambios; ajustar sólo queries que dependieran de la estructura de dos líneas, si las hay.
- [x] 3.2 Correr el lint sobre los archivos tocados.
- [x] 3.3 Levantar `pnpm dev:auth` y verificar en pantalla: la franja del resumen es visiblemente más baja (~35–40% en la card de distribución), ningún espaciado cayó en el vacío (filas separadas, pie con respiración, eje alineado), los descriptores se leen o truncan con `title`, y el listado gana el espacio cedido.
- [x] 3.4 Verificar que la correspondencia de color card–listado sigue intacta (mismas clases `bg-accent-<matiz>-fill`).
