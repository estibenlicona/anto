## 1. Restaurar la card

- [x] 1.1 En `PeopleStatsCards.tsx`, reemplazar el bloque de filas/eje de la tercera card por la composición inicial: `SegmentedBar separated` con segmentos `{value, label, tone}` por nivel, y la leyenda 2×2 (`ul` con punto `bg-accent-<matiz>-fill`, nombre y conteo por nivel).
- [x] 1.2 Conservar el encabezado con "N personas" y el pie actual con sus dos lecturas, filete y cálculos (`advancedPct`, `needsSupport`), sin tocar textos ni guardas.
- [x] 1.3 Restaurar el mapeo nivel → tono para los segmentos (`Record<number, AccentTone>`) junto al de clases de la leyenda, y borrar `SENIORITY_DESCRIPTORS`, `axisMaxFor`, `axisMarksFor` y `ROW_GRID_STYLE`.
- [x] 1.4 Recuperar `SegmentedBar` en los imports y correr el typecheck.

## 2. Pruebas

- [x] 2.1 Reescribir `PeopleStatsCards.test.tsx`: la leyenda muestra los cuatro niveles con su punto de la clase de acento correcta y su conteo; los segmentos de la barra llevan tonos de acento y ninguna clase semántica `-bold`; el pie conserva sus dos lecturas con los números del mock ("61% en avanzado o superior", "2 requieren acompañamiento").
- [x] 2.2 Correr `npx vitest run src/features/people` y el lint sobre los archivos tocados.

## 3. Verificación en pantalla

- [x] 3.1 Levantar `pnpm dev:auth` y confirmar: la card volvió a la barra segmentada con leyenda, es más baja que la versión de filas, el pie se lee al pie, y la franja del resumen queda pareja.
- [x] 3.2 Confirmar la correspondencia de color card–listado por clase compartida (`bg-accent-<matiz>-fill`), turquesa incluido.

## 4. Nota de archivado

- [x] 4.1 Dejar confirmado (ya está en proposal y design) que al archivar: `redesign-seniority-distribution-card` y `compact-people-stats-cards` van **sin sincronizar** su delta; este change se sincroniza normal contra el spec principal.
