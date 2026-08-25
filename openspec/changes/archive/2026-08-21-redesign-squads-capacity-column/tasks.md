## 1. Contrato y mock

- [x] 1.1 En `squadService.ts`, agregar `teamAvailableFte: number` (sólo lectura) a `SquadDto`; en `SquadAdapter.ts`, propagarlo a `Squad` con `?? 0`.
- [x] 1.2 En `squads.handlers.ts`, extraer `teamAvailableFteOf(allocations)` (suma del `availableFte` de las personas asignadas desde `getPeopleSnapshot()`), usarlo en `enrich()` y en `computeTeamStats()`.
- [x] 1.3 Tests: `squads.handler.test.ts` (`teamAvailableFte` = Σ `availableFte` de las personas de la célula; 0 sin equipo), `SquadAdapter.test.ts` (propagación y normalización); actualizar fixtures de `SquadDto`/`Squad` en `useSquads.test`, `useSquad.test`, `SquadDetailHeader.test`, `SquadsList.test`.

## 2. Columna Capacidad

- [x] 2.1 Crear `features/squads/components/capacity.ts` con `capacityOccupancy(allocatedFte, teamAvailableFte)` → `{ pct, textClass, atCapacity }` (umbrales 85/100, sin división por cero) y su test de bordes.
- [x] 2.2 En `SquadsList.tsx`, reemplazar la celda Capacidad por el bloque del mockup: `asignado / disponible FTE` + porcentaje coloreado, barra apilada BAU/Transf. sobre el FTE del equipo (clases `MIX_LEGEND_DOT_CLASSES` importadas de `SquadTeamStatsCards`), leyenda con cifras y "N libre" / "Al tope"; variante sin equipo (0.0 FTE, barra vacía, "Sin capacidad asignada"); `max-w` de 260 px.
- [x] 2.3 Tests en `SquadsList.test.tsx`: escenario 1.8 / 2.0 (90 % advertencia, anchos de tramos, leyenda, "0.2 libre"), "Al tope" en peligro al 100 %, espacio en éxito, sin equipo.

## 3. Card de distribución por criticidad

- [x] 3.1 En `SquadsStatsCards.tsx`, reemplazar `SegmentedBar` por la barra local con `CRITICALITY_HEAT` (danger-bold / brand-bold / brand-bold + opacity-45 / gris de borde), usar el mismo mapa en los puntos de la leyenda (punto de Baja con borde), omitir segmentos en cero, y agregar el pie "N de M células en criticidad alta o crítica". Dejar el comentario sobre el token intermedio de marca.
- [x] 3.2 Tests en `SquadsStatsCards.test.tsx`: clases de la escala en segmento y punto por nivel, ausencia de `bg-warning-bold`/`bg-info-bold`, segmento en cero ausente pero presente en la leyenda, pie "3 de 5 …", y que `SquadsContainer.test` siga verde.

## 4. Verificación

- [x] 4.1 Correr `npx vitest run src/features/squads src/mocks` y el typecheck sin regresiones frente al baseline (fallos pre-existentes: `App.test.tsx`, `httpClient.test.ts`).
- [x] 4.2 Levantar la app en modo mock y comparar `/app/lead/celulas` con el artboard principal del artifact "Listado de Células": celda Capacidad (Backend Platform 2.7 / 3.8, 71 %, barra y "1.1 libre"; Canales Digitales "Al tope"; Pagos Instantáneos sin capacidad) y card con la escala de calor y su pie.
