## 1. Paquete

- [x] 1.1 En `frontend/`, reinstalar `@tuya-ui/components` desde el `.tgz` local y confirmar que `node_modules/@tuya-ui/components/dist/index.d.ts` declara `CapacityBar`, `DistributionCard`, `Meter`, `SegmentedBarHeat` y que `styles.css` trae `bg-brand-strong`.

## 2. Células

- [x] 2.1 En `SquadTeamStatsCards.tsx`, reemplazar `MIX_LEGEND_DOT_CLASSES` por `MIX_TONES` (`{ bau: "slate", transformation: "blue" }`) y la card de mix por `DistributionCard` (`separated={false}`, `totalNoun="FTE"`, pie "% del esfuerzo va a operación").
- [x] 2.2 En `SquadsList.tsx`, reemplazar `CapacityCell` por `CapacityBar` (partes con `MIX_TONES`, `unit="FTE"`, `parts={[]}` sin equipo, `className` de ancho máximo); eliminar `components/capacity.ts` y `__test__/capacity.test.ts`.
- [x] 2.3 En `SquadsStatsCards.tsx`, reemplazar la barra manual y la leyenda por `DistributionCard` con `CRITICALITY_HEAT` (`max/high/mid/low`) y el pie "N de M células en criticidad alta o crítica"; eliminar `CRITICALITY_HEAT_CLASSES`.
- [x] 2.4 Ajustar tests: `SquadsList.test.tsx` (aria-label de ocupación, textos libre/tope/vacío, clases de relleno en la barra), `SquadsStatsCards.test.tsx` (clases de la escala por punto de leyenda, segmento en cero ausente vía `.gap-hug > div`, pie), `SquadTeamStatsCards.test.tsx` (leyenda y pie del mix), `SquadDetailContainer.test.tsx` / `SquadsContainer.test.tsx` si dependían de la estructura anterior.

## 3. Personas y equipo

- [x] 3.1 En `PeopleStatsCards.tsx`, reemplazar la card de seniority por `DistributionCard` (`tone` por `SENIORITY_TONES`, `totalNoun="personas"`, pie con las dos lecturas); eliminar `LEGEND_DOT_CLASSES`.
- [x] 3.2 En `PeopleList.tsx`, reemplazar la celda de utilización por `Meter` (`warningFrom={100}`); en `AllocationsList.tsx`, reemplazar la celda de dedicación por `Meter` (`warningFrom={100}`, ancho máximo por clase) y pasar la mini barra BAU/Transf. a `size="sm"` con ancho por clase; eliminar `people/components/utilization.ts` y su test.
- [x] 3.3 Ajustar tests: `PeopleStatsCards.test.tsx` (puntos de leyenda y pie), `PeopleList.test.tsx` y `AllocationsList.test.tsx` (relleno por umbral y ancho leyendo el hijo de `[role=progressbar]`).

## 4. Verificación

- [x] 4.1 `grep` de control: ningún `opacity-`, `utilizationFillClass`, `capacityOccupancy`, `MIX_LEGEND_DOT_CLASSES`, `CRITICALITY_HEAT_CLASSES`, `LEGEND_DOT_CLASSES` ni `style={{ height|minWidth|maxWidth|width` de barras en `features/`.
- [x] 4.2 `npx vitest run src/features` + typecheck + lint sin regresiones frente al baseline (fallos pre-existentes: `App.test.tsx`, `httpClient.test.ts`).
- [x] 4.3 Levantar la app en modo mock y comparar Células (listado y detalle) y Personas con el estado anterior: mismas cifras, umbrales, textos y colores; "Media" en la card de criticidad con el token de marca atenuada.
